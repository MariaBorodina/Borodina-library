import { Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { Increment, IncrementFileFormat } from '../../shared/models/library.model';
import { SupabaseService } from './supabase.service';

const ALLOWED_FORMATS: Record<string, IncrementFileFormat> = {
  epub: 'epub',
  pdf: 'pdf',
  txt: 'txt',
};

const MIME_TO_FORMAT: Record<string, IncrementFileFormat> = {
  'application/epub+zip': 'epub',
  'application/pdf': 'pdf',
  'text/plain': 'txt',
};

export interface CreateIncrementInput {
  book_id: string;
  title: string;
  file: File;
  sort_order?: number;
}

@Injectable({ providedIn: 'root' })
export class IncrementService {
  constructor(private readonly supabase: SupabaseService) {}

  getIncrementsByBook(bookId: string): Observable<Increment[]> {
    return from(
      this.supabase.requireClient()
        .from('increments')
        .select('*')
        .eq('book_id', bookId)
        .order('sort_order'),
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return (data ?? []) as Increment[];
      }),
    );
  }

  createIncrement(authorId: string, input: CreateIncrementInput): Observable<Increment> {
    const format = this.resolveFormat(input.file);
    if (!format) {
      throw new Error('Supported formats: EPUB, PDF, TXT only.');
    }

    if (input.file.size > 52_428_800) {
      throw new Error('File too large. Maximum size is 50MB.');
    }

    const incrementId = crypto.randomUUID();
    const ext = format;
    const path = `${authorId}/${input.book_id}/${incrementId}.${ext}`;

    return from(
      (async () => {
        const { data: quotaOk } = await this.supabase.requireClient().rpc('check_storage_quota', {
          p_additional_bytes: input.file.size,
        });

        if (!quotaOk) {
          throw new Error('Storage quota exceeded');
        }

        const { error: uploadError } = await this.supabase.requireClient().storage
          .from('book-increments')
          .upload(path, input.file);

        if (uploadError) {
          throw uploadError;
        }

        const { data, error } = await this.supabase.requireClient()
          .from('increments')
          .insert({
            id: incrementId,
            book_id: input.book_id,
            title: input.title,
            file_path: path,
            file_format: format,
            file_size_bytes: input.file.size,
            sort_order: input.sort_order ?? 0,
          })
          .select()
          .single();

        if (error) {
          await this.supabase.requireClient().storage.from('book-increments').remove([path]);
          throw error;
        }

        return data as Increment;
      })(),
    );
  }

  deleteIncrement(incrementId: string): Observable<void> {
    return from(this.supabase.requireClient().rpc('delete_increment', { p_increment_id: incrementId })).pipe(
      map(({ error }) => {
        if (error) {
          throw error;
        }
      }),
    );
  }

  getIncrementPublicUrl(path: string): string {
    const { data } = this.supabase.requireClient().storage.from('book-increments').getPublicUrl(path);
    return data.publicUrl;
  }

  mapIncrementError(error: unknown): string {
    if (error && typeof error === 'object') {
      const err = error as { message?: string; code?: string };
      if (err.code === '23505' || err.message?.includes('increments_book_title_unique')) {
        return 'Increment title already exists. Use a unique title.';
      }
      if (err.message?.includes('Storage quota exceeded')) {
        return 'Storage quota exceeded';
      }
      if (err.message?.includes('Failed to fetch') || err.message?.includes('network')) {
        return 'Network error. Upload failed.';
      }
      if (err.message) {
        return err.message;
      }
    }
    return 'Upload failed. Please check the file and try again.';
  }

  private resolveFormat(file: File): IncrementFileFormat | null {
    const mimeFormat = MIME_TO_FORMAT[file.type];
    if (mimeFormat) {
      return mimeFormat;
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    return ALLOWED_FORMATS[ext] ?? null;
  }
}
