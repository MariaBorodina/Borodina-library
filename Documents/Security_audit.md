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
