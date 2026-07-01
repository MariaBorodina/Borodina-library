# Домашнее задание №6 - Настройка CI/CD и интеграция сервисов
## Проверка безопасности 
### General security check - Cursor
для работ с безопасностью создала ветку Security-audit-and-fixes
perform security check of my project 
#### Result
найдены уязвимости, и курсор предложил их исправить. Критическая проблема только одна, в Supabase edge function. Полный отчет находится в файле security_report.md.
### Фиксим критическую и высокие уязвимости
now Fix edge function ownership validation
...
#### Result
были пофикшены уязвимости (преимущественно по базе), помеченные severity >= high. Проверка пройдена. История по коммитам находится в ветке Security-audit-and-fixes.
### OWASP Top 10 check
check the project for OWASP top 10, add the result of this check as the "Overall posture" table to the Documents/security_report.md file
#### Result
В целом одобрил структуру и произведенные фиксы. 
### Рекомендации
Дельная рекомендация - мониторинг и аудит ошибок. Хотя мониторинг является встроенной фичей Supabase, надо внедрить его и на строне UI, а также наладить общее логирование.

# Интеграция с Yandex Cloud Storage
*я использовала внешний сервис для хранения картинок - в данном случае обложек книг. Также сюда могут в дальнейшем сохраняться картинки из комментариям к книгам (в MVP не реализовано), что в эпоху цифрового рисования и ИИ-генерации артов к книгам очень востребовано.*

## prompts for integration
plan using yandex cloud storage to store book covers in the project instead of storing them on supabase. I already created bucket "borodina-library" there and created service account "acc2"

build

is there all yandex storage configuration done or should i configure something?

### Result
Картинки успешно хранятся в Yandex Cloud Storage, параметры коннекции к нему сидят в секретах Supabase.
Запись картинки осуществляется через Supabase edge function.

## prompts for integration instructions
write instruction for Yandex Cloud Storage integration into this application into file Yandex_Storage_instruction.md in the Documents folder

### Result
написано длинное руководство, где описано с разных сторон как происходит порядок вызовов различных сервисов и что для этого нужно настроить.
файл \Documents\Yandex_Storage_instruction.md





