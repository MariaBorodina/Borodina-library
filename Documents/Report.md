# UI concept
## used Kimi

Generate UI design conception for a web app with online library of modern fantasy and Sci-Fi novels. 
Generate only HTML and styles, without code.  Adopt bold, inspiring, yet comforting tones. Suggect 3 design conceptions with different look and feel.
Add pictures to the homepage.

I like the concept 1 most. Please change font for headers - I would like it to have more character.  Also make pictures in better quality and more adapted to wide display. You may dismiss other two concepts.



# User journey generation
## User journey 1 - Reader 
### try1: Cline + nvidia/nemotron-3-super-120b-a12b:free
**Role** You are a person who loves to read fantasy and fiction.

**Task** Generate user journey (Happy path only) for the MVP of a web app with online library of modern fantasy and Sci-Fi novels.  
**Context**: User is a random book lover, wishing to browse for a book that captures their fansy, then look on the page with book info, then open  book for paginated reading. This MVP does not include role-based interface. We will add authentication later.
Have in mind UI design layout listed in the folder "UI concept". 
**Constraints**: Critically important stages only. No more then 15 stages. 
User may be authorized or not, it should not prevent them from browsing, searching and reading books.
**Format**: Use markdown format. Write it into file "User_journey1.md"
Every stage have to have such fields:
- User goal 
- Actions 
- Touchpoints 
- Emotions 
- Pain points 
- Improvements 

#### Result
полный отстой, куча лишнего. Да, все 15 шагов, но для сторей вообще не подходит. Может, роль указана неверная?

### try2: Cline + nvidia/nemotron-3-super-120b-a12b:free

**Task** Generate user journey (Happy path only) for the MVP of a web app with free online library of modern fantasy and Sci-Fi novels.  
**Context**: User is a book lover, wishing to browse for a book that captures their fansy, then look on the page with book info, then open  book for paginated reading. Add authentication, but it's not obligatory for the user. In the online library we'll need those sections available for all: home page with hero section, folders "Browse by Realm", "Authors", and "Search". For authenticated users, another section: "My Books".
**Constraints**: Critically important stages only. No more then 15 stages. 
User may be authorized or not, it should not prevent them from browsing, searching and reading books.
**Format**: Use markdown format. Write it into file "User_journey1.md"
Every stage have to have such fields:
- User goal 
- Actions 
- Touchpoints 
- Emotions 
- Pain points 
- Improvements 
#### Result
неплохо описал как юзер приходит, выбирает книжку и читает - 12 стадий. Но бедновато. Попробуем дополнить вторым user journey

### try2_1: Cline + nvidia/nemotron-3-super-120b-a12b:free
add to the user journey stage to like a book and optional stage for authentication
#### Result
добавил, разумно

### try2_2: Cline + nvidia/nemotron-3-super-120b-a12b:free
in the user journey: add "Sing in / Sign up" to the stage 1 - actions - navigation menu
#### Result
ок

### try3: deepseek in browser
prompt the same as in try2
#### Result
гораздо лучше, он сделал фуркацию по разным путям. Правда, секцию My books он понял по-своему, но его вариант хорош, мне нравится.
возможно приму его версию - кладу в ветку User-Stories-and-Specs-2


## User journey 2 - Author
### try1: Cline + nvidia/nemotron-3-super-120b-a12b:free

**Task** For the same web app of online library Generate user journey for the author of the books.
**Context**: User is a book author. 
They should see section "Books by me" in the navigation menu. On entering this section, they should see the books authored by them. 
They should be able to add new book (with book info), edit book info, upload new increment of book content, edit or remove existing increment of book content, and remove a book.
**Constraints**: Critically important stages only. No more then 15 stages. 
User should be authorized for those actions.
**Format**: Use markdown format. Write it into file "User_journey2.md"
Every stage have to have such fields:
- User goal 
- Actions 
- Touchpoints 
- Emotions 
- Pain points 
- Improvements 
#### Result
хорошо!

### try2: deepseek in browser
prompt the same as in try1
#### Result
неплохо, схема развесистая, но я забыла про аутентификацию. Сама бы конечно не забыла на каждом ендпойнте поставить атрибут, но тут же не я буду код писать.

### try2_1: deepseek in browser
update this user journey markdown so, that "Books by me" section and all actions in it is available only to authenticated users
#### Result
вообще отлично, все четко. эту оставляем.






# User stories generation
## try1: Cline + nvidia/nemotron-3-super-120b-a12b:free
**Task** Generate list of User Stories for the MVP of a web app with free online library of modern fantasy and Sci-Fi novels. 
Use the User Journeys you generated in files  User_journey1.md,  User_journey2.md.
**Format**: Use markdown format. Write it into file "User_stories.md"
All user stories should be written as "I, as <role>, want <action>, for <goal>".
Every user story should have Acceptance Criteria in Gherkin format.
Prioritize user stories as Must have, Should have, Nice to have.
Sort user stories by priority.
#### Result
нормально, хотя я бы такое описание сторей не делала, оно какое-то запутанное. Но если ИИшке так будет понятнее, что делать, то кто я, чтобы ей мешать.

## try1_1: Edge cases and Negative scenarios
Describe most probable negative scenarios for the User Journey in files User_journey1.md,  User_journey2.md (unsuccessful signin, incorrect user input, empty book folder, search found no books, error opening book for reading, failure to add/update/delete book, ...). 
No more then 10 scenarios.
Use markdown format. Write it into file "Negative.md"
### Result
нормально

## try2_1: deepseek in browser
*промпт немного изменила для дипсика, поскольку он не с файлами работает, а я использовала тот же чат. Начала в этот раз с негативных сценариев.*
using both user journeys (for reader and author), Describe most probable negative scenarios for (unsuccessful signin, incorrect user input, empty book folder, search found no books, error opening book for reading, failure to add/update/delete book, ...). 
No more then 30 scenarios.
Use markdown format.
### Result
бинго!! Правда, тут я позволила 30 сцераниев, все же функционал такой тупой. Дипсик рулит.

## try2_2: deepseek in browser
*промпт немного изменила для дипсика, поскольку он не с файлами работает, а я использовала тот же чат.*
**Task** Using both user journeys (for reader and author) and a list of negative scenarios you generated, generate list of User Stories.
**Format**: Use markdown format.
All user stories should be written as "I, as <role>, want <action>, for <goal>".
Every user story should have Acceptance Criteria in Gherkin format.
Prioritize user stories as Must have, Should have, Nice to have.
Organize user stories by priority.
### Result
отлично, сгенерено 27 юзер сторей, из них 14 обязательные. Как-то дипсик мне их визуализировал, файл с визуалом я записала.

## try2_3: deepseek in browser
*добавим недостающие юзер стори, а то мне как-то не хватает сторей на создание страниц и раутинга*
Analyse User Journeys in the files User_Journey_1_deepseek.md and User_Journey_2_deepseek.md, and the list of User Stories in the file User_Stories_deepseek.md.
Append to the list of User Stories a set of new User Stories to create a set of pages necessary to complete the User Journey.
Use the same format as the existing User Stories. 
### Result
дипсик сделал умное лицо и сгенерил стори для создания страниц и их наполнения, с которых в общем-то надо было и начинать. Окей, сложила их в файлик User_Stories_for_Pages.md.




# Specification generation
## try1: Cline + nvidia/nemotron-3-super-120b-a12b:free
**Task** Generate technical specification for the MVP of a web app with free online library of modern fantasy and Sci-Fi novels.  Generate both functional and non-functional requirements. This spec will go to AI agents for implementation.
**Context**: Use User Stories in the file User_Stories.md. 
Use Negative scenario list in the file Negative.md to plan edge cases and failures.
**Format**: Use markdown format. Write it into file "Specification.md"
Keep in mind User journeys in the files User_journey1.md,  User_journey2.md.
Spec should consist of 2 parts: Functional requirements and Non-functional requirements, each of them consisting of numbered list of requirements.
Every requirement should be written as "When <condition> system should <action> to have <result>."
Every requirement should be measurable.
Non-functional requirements should be measurable as well (time, quantity, ...).
All entities (lists, tables, code blocks) should be explicitly marked.
**Perform this task is steps**:
1. Read all User stories and ACs
2. Find all dependencies between USs (for instance, US3 depends on US1)
3. Generate requirements
4. Suggest one optimization (for instance, deduplicate requirements, make edge cases more specific)
5. Check if this optimization breaks the original logic of the User journey, User stories and US dependencies. If the logic is broken even in one place, revoke optimization. If all logic persists, apply the optimization.

### Result
че-то накропало, левое немножко.

## try2: deepseek in browser
*Использовала режим DeepThink. промпт немного изменила для дипсика, поскольку он не с файлами работает, а я использовала тот же чат.*
**Task** Using the list of user journeys you generated, Generate technical specification for the MVP of a web app with free online library of modern fantasy and Sci-Fi novels.  Generate both functional and non-functional requirements. This spec will go to AI agents for implementation.
**Format**: Use markdown format. 
Keep in mind both user journeys (for reader and author) and a list of negative scenarios use generated.
Spec should consist of 2 parts: Functional requirements and Non-functional requirements, each of them consisting of numbered list of requirements.
Every requirement should be written as "When <condition> system should <action> to have <result>."
Every requirement should be measurable.
Non-functional requirements should be measurable as well (time, quantity, ...).
All entities (lists, tables, code blocks) should be explicitly marked.
**Perform this task is steps**:
1. Read all User stories and ACs
2. Find all dependencies between USs (for instance, US3 depends on US1)
3. Generate requirements
4. Suggest one optimization (for instance, deduplicate requirements, make edge cases more specific)
5. Check if this optimization breaks the original logic of the User journey, User stories and US dependencies. If the logic is broken even in one place, revoke optimization. If all logic persists, apply the optimization.

### Result
мне понравилось, нормальная вроде спека. Нумерацию дипсик сделает конечно специфическую, но так наверное даже удобнее.

## Pull Request: Choose Spec
берем в работу спеку и стори от дипсика, даем пулл реквест в мастер и поехали разрабатывать.


# Frontend - create project
## try1: Cline + poolside/laguna-m.1:free (+skills, rules)
Create new frontend project with tech stack listed in TechStack.md. 
Name this project FictioneersUI. Create new folder "FictioneersUI" for this project.

move all project code and package.json and all others to FictioneersUI folder

### Result
Нагенерил большую кучу - создал проект, загрузил нужные библиотеки, прописал package.json и прочее.
долго его мусолил, и в итоге добился работающего кода. Запустил на http://localhost:4200 .
Однако! Сгенерил довольно сложную home page, добавив туда кучу элементов, не имеющих никакого отношения к моей теме. 
Я сохранила это чудо (а оно пожрало очень много времени и токенов, жаль выбрасывать) в ветке "Frontend-create-try-1".

## try2: Cline + poolside/laguna-m.1:free (+skills, rules)
*переработала запрос*
In new folder "FictioneersUI", create new frontend project with tech stack listed in TechStack.md. 
Name this project FictioneersUI. 
For this project choose design concept fron the "UI concept" folder.
Create for now only empty home page. Do not create any other pages.
This home page should be loadable, contain styles listed in "chronicles_aether_ink.html", and nothing more.

### Result
работал ооочень долго, файлы записывал и стирал, но в конечном итоге сделал то, что я просила, без подполнительных запросов и тычков с моей стороны.
Сгенерена заглавная страница, сделаны стили, лейаут. Страница запускается. Выложила в ветку "Frontend-create-try-2".
Tailwind установлен, но стили сделаны без него. Попробуем-с перевести их на классы Tailwind следующим промптом.

## try2_1: Cline + poolside/laguna-m.1:free (+skills, rules)
In the FictioneersUI project transform basic css styles to Tailwind classes. Do not remove any libraries and frameworks that are already installed.  Do not change version of  libraries and frameworks that are already installed.

Заодно добавила вот такой рул, чтобы Cline перестал пытаться исполнить сразу несколько стейтментов и ловить потом ошибки в терминале:
Do not use "&&" as a statement separator when executing commands in the terminal.
Execute one statement at a time.

### Result
зря я написала про basic. в итоге он каждую строку перетащил в отдельный класс, и на элементы меню применено классов по 20 на каждый (и дальше так же).
Работал очень долго, а в итоге сделал страницу нечитаемой. Стираю.

## try2_2:  Cline + poolside/laguna-m.1:free (+skills, rules)
In the FictioneersUI project replace css styles with Tailwind classes. Keep class names and styles. Do not use atomar classes like "absolute", "inset-0".

### Result
почему-то опяить бесконечно тупит. Может доступ к модели лагает... Перезагрузила комп. теперь он превысил лимит обращений к бесплатным моделям. А задачу-то так и не довел до конца. Вот офигеть у него задача была сложная - в одном файлике стили поменять.

## try3_1:  Cursor (Auto)
*тот же запрос*
In the FictioneersUI project replace css styles with Tailwind classes. Keep class names and styles. Do not use atomar classes like "absolute", "inset-0".

### Result
Курсор справился отлично, за 3 минуты сделал, проверил, пофиксил бажки.



# Frontend - implement User Stories
## try1: Cursor
*а давайте начнем с планирования. Сторя какая-то уж очень большая, ее бы лучше разбить на под-стори.*
Plan implementation of User Story US‑P‑02 from the file User_Stories_for_Pages.md, keeping in mind user journeys in the files  User_Journey_1_deepseek.md and User_Journey_2_deepseek.md. 
write down your plan for this story into US‑P‑02-Browse-by-Realm-page.md file to read it for implementing this story. 
### Result
план мне понравился, спланировал хорошие компоненты для страницы. Разбил на стадии, предложил начать с лейаута страницы. Пусть имплементит. Записал его в US‑P‑02-Browse-by-Realm-page.md.

## try1_1: Cursor
ok, implement Phase 0 + Phase 1 
### Result
сделал основную часть страницы, и карточки "царств" сделал, вместо обращения к базе пока массив-заглушка. Карточки кликабельные. Стили надо бы ему еще доработать. 
Сделал тесты, прогнал - успешно. Я запустила проект, страницу потыкала. Комплексую.

## try1_2: Cursor
proceed with implementing phase 2
### Result
добавил поиск, пока только с пустым результатом. улучшил карточки.

## try1_3: Cursor
using implementation plan in US‑P‑02-Browse-by-Realm-page.md, proceed with implementing phase 3
### Result
страница "авторы", подправил по моей просьбе стили заголовков, чтобы было красивше. Тестов добавляет на каждом шаге.
Вообще мне курсор нравится, ттт работает быстро, соображает четко. Оплатила на него подписку.

## Pull Request: take Frontend project into master
проектик мне нравится. Продолжим имплементить стори чуть позже, сейчас наладим бэк.

*вернулась сюда после полного подъема бека на supabase*

## try2: Cursor (plan mode)
Plan implementation of User Story US‑P‑03: Realm detail page from the file User_Stories_for_Pages.md, keeping in mind user journeys in the files  User_Journey_1_deepseek.md and User_Journey_2_deepseek.md. 
Write down your plan for this story into US‑P‑03-Realm-detail-page.md file to read it for implementing this story. 
### Result
сделал страничку, вроде все хорошо. Однако погоняв ее, я обратила внимание, что база (она у меня в облаке) сегодня стала медленно работать и ингода зависать в стадии loading. При этом я заставила убрать локальные заглушки со списком жанров, чтобы точно была только подгрузка из базы. Что ж, то и повод для оптимизации.



## try3: Cursor 
Plan implementation of User Story US‑P‑04: Book info page from the file User_Stories_for_Pages.md, keeping in mind user journeys in the files  User_Journey_1_deepseek.md and User_Journey_2_deepseek.md. 
Write down your plan for this story into US‑P‑04-Book-info-page.md file to read it for implementing this story. 

### try3_1: Cursor 
proceed with implementing Stage 1.
### Result
сделал страничку. Однако! Вернул опять заглушки с жанрами, и понаставил заглушек везде. Окей, я попробовала запустить на заглушках - и сайт завалился. Курсор героически с этим боролся.

## try4: Cursor 
Plan implementation of a page for user story "US‑P‑09: Login page / modal" from the file User_Stories_for_Pages.md, keeping in mind user journeys in the files  User_Journey_1_deepseek.md and User_Journey_2_deepseek.md. 
Write down your plan for this story into US‑P‑09-Login-page.md file to read it for implementing this story. 

## try5: Cursor
*публикация черновика книги*
read user stories in files User_Stories_for_Pages.md and User_Stories_deepseek.md, and add user story for publishing a book. It should apply to authenticated user, that is an author, and on some draft book they should have a button "publish", on which the book's status should become "published". Add this story into User_Stories_deepseek.md file.
### Result
нормальная сторя сделана, и имплементация тоже.


## Adaptive layout 
refactor UI so that the layout will be adaptive for both computer display and mobile. if needed, suggect skills useful for mobile layout.
### Result
нормально, подправил стили, поставил брейкпойнты - на телефоне выглядит и работает окей (проверила на своем после деплоя).





# Backend 
## try1: Cursor (Plan mode)
Read the documents in the Specificaions folder. Make a plan of backend for Supabase, including user authentication.
### Questions
> Where will Supabase run for development?
Both: local CLI for dev, linked cloud project for staging/prod
### Result
Накропал огромный план, записал его в .cursor\plans\supabase_backend_plan_1d2a6fd5.plan.md.
Структура базы предложена логичная, я посмотрела. Есть в принципе что расширить, но основная часть и функционал покрыты верно, связи между таблицами корректные. 

## try1_1: Cursor 
Build 
*Курсор предложил мне нажать "Build", я и нажала*
### Result
Вообще я ожидала, что он будет выполнять план по шагам - там было аж 10 шагов. Но он решил все шаги сразу сделать, и даже сделал.
Создал каталог для базы - \supabase, положил туда 6 миграций с понятным именованием - создание структуры, таблицы, триггеры, RLS.
Сделал seed.sql с жанрами книг.
Перенастроил заглушки в интерфейсе на запросы в базу.

## try1_2: *попытка поднять Supabase локально*
*Я почему-то решила, что для разработки проще будет иметь локальный инстанс базы, а на "prod" уже будем использовать облачный.*
*Не очень понимая, что происходит, стала задавать курсору глупые вопросы.* 
### try1_2_1:
is supabase run now locally?
#### Result
Курсор сказал, что надо поставить Docker desktop, а потом запустить npm supabase start и npm supabase db reset.
Окей, поставила Docker desktop и WSL.
Команда "npm supabase start" занимала безумно долгое время и падала при попытке загрузке одного из имаджей. Я сделала несколько попыток, потратив вечер и утро, но разные images все время недогружались. Курсор мне объяснил, что не так, анализировал лог, предлагал варианты. 
В конце концов я решила, что предложенный им альтернативный вариант - обращаться из локального проекта к облачной базе- будет лучше.

## try1_3: *попытка использовать Supabase в облаке*
### try1_3_1: создала бесплатный проект на Supabase.com
#### Result
Проект Fictioneers

### try1_3_2: link to DB and migrations
*Соответственно запросила у курсора инструкцию*
#### Result
сама сделала линк к проекту на supabase
запуск миграций упорно не удавался. Выяснилось - курсор анализировал - что у меня в сети закрыт порт 5432, который для этого необходим.

### try1_3_3: running migrations
по рекомендации курсора каждую миграцию запустила в SQL Editor
#### Result
успешно

### try1_3_4: update environment.ts
проапдейтила environment.ts, чтобы указывал на облачный проект
#### Result
успешно прошел запуск, проверила в Dev tools - запрос идет на hprewyefppbdwlwnpcag.supabase.co





# CI/CD
create github actions workflow for this project

good, add deploy workflow to deploy on github

## Result
вокрфлоу добавлено и проверено, работает. При пуше в ветку master запускаются билды, тесты, и деплоится на GitHub pages.


# Yandex Cloud Storage
plan using yandex cloud storage to store book covers in the project instead of storing them on supabase. I already created bucket "borodina-library" there and created service account "acc2"

build

is there all yandex storage configuration done or should i configure something?


# Presentation and documents
in file "Презентация проекта на курсе AI agents продвинутое использование_1.pptx" written in Russian make the third page with info about me organized into well-readable format with bullet list (still in Russian). If you need some skill or mcp let me know