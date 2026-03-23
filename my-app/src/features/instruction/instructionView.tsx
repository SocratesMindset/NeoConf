import Link from "next/link";

const quickStartSteps = [
  "Откройте страницу регистрации и создайте аккаунт с нужной ролью.",
  "После входа перейдите в свой рабочий кабинет через верхнее меню.",
  "Проверьте, что для вашей роли уже есть доступные данные: конференции, статьи или назначения.",
  "Выполните действия по своей роли и дождитесь уведомления об успешном сохранении.",
];

const systemRoutes = [
  {
    title: "Участник",
    href: "/participant",
    description: "Регистрация на конференцию и загрузка статьи.",
  },
  {
    title: "Рецензент",
    href: "/reviewer",
    description: "Просмотр назначенных статей и отправка рецензий.",
  },
  {
    title: "Председатель секции",
    href: "/section-chair",
    description: "Распределение статей между рецензентами.",
  },
  {
    title: "Администратор",
    href: "/admin",
    description: "Создание конференций и назначение представителей секций.",
  },
];

const roleInstructions = [
  {
    title: "Администратор",
    summary: "Готовит площадку для работы остальных ролей.",
    steps: [
      "Создайте конференцию с названием, городом и датой начала.",
      "Назначьте представителей секций для нужной конференции.",
      "Проверьте, что секции появились в системе до начала приёма статей.",
    ],
  },
  {
    title: "Участник",
    summary: "Регистрируется на конференцию и подаёт материалы.",
    steps: [
      "Выберите конференцию в блоке регистрации и отправьте заявку.",
      "Укажите секцию, название статьи и аннотацию.",
      "Загрузите файл статьи в формате PDF, DOC или DOCX.",
      "После загрузки проверьте, что статья появилась в списке последних материалов.",
    ],
  },
  {
    title: "Председатель секции",
    summary: "Организует рецензирование поступивших статей.",
    steps: [
      "Откройте кабинет председателя и выберите доступную статью.",
      "Укажите ФИО и email рецензента.",
      "Убедитесь, что назначение сохранилось и появилось в истории.",
    ],
  },
  {
    title: "Рецензент",
    summary:
      "Оставляет оценку и содержательный комментарий по назначенным статьям.",
    steps: [
      "Откройте список своих назначений и выберите нужную статью.",
      "Поставьте оценку от 1 до 10.",
      "Добавьте комментарий с сильными сторонами и замечаниями.",
      "Сохраните рецензию и проверьте, что она появилась в последних рецензиях.",
    ],
  },
];

const articleRequirements = [
  "Допустимые форматы файла: PDF, DOC, DOCX.",
  "Файл не должен быть пустым.",
  "Перед загрузкой подготовьте понятное название статьи и краткую аннотацию.",
  "Выбирайте секцию осознанно: именно по ней статья попадёт на распределение.",
];

const processStages = [
  {
    title: "1. Подготовка конференции",
    text: "Администратор создаёт конференцию и назначает представителей секций.",
  },
  {
    title: "2. Регистрация участников",
    text: "Участники выбирают конференцию и фиксируют своё участие.",
  },
  {
    title: "3. Подача статей",
    text: "Материалы загружаются в систему и становятся доступны для дальнейшей обработки.",
  },
  {
    title: "4. Назначение рецензентов",
    text: "Председатель секции распределяет статьи по рецензентам.",
  },
  {
    title: "5. Рецензирование",
    text: "Рецензенты выставляют оценки и оставляют комментарии по назначенным статьям.",
  },
];

const supportNotes = [
  "Если после входа кабинет пустой, сначала проверьте, соответствует ли ваша роль нужному разделу.",
  "Если действие не сохраняется, посмотрите текст ошибки под формой: сервер возвращает причину прямо в интерфейс.",
  "Если не удаётся войти, убедитесь, что вы используете email и пароль от уже зарегистрированного аккаунта.",
];

export default function InstructionView() {
  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#816040]">
          Инструкция по работе с NeoConf
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Как работать с системой конференции
        </h1>
        <p className="max-w-3xl text-base text-[#6A4A2D]">
          Эта страница собрана как единая инструкция для всех ролей. Сначала
          зарегистрируйтесь, затем перейдите в свой кабинет и выполняйте только
          те действия, которые соответствуют вашей роли в процессе конференции.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Быстрый старт</h2>
          <ol className="mt-4 space-y-3 text-sm text-[#5D4128]">
            {quickStartSteps.map((step, index) => (
              <li
                key={step}
                className="flex gap-3 rounded-xl bg-[#F5F5DC] px-4 py-3"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#734222] text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/auth/register"
              className="inline-flex rounded-full bg-[#734222] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#8A4F29]"
            >
              Создать аккаунт
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex rounded-full border border-[#C7B288] bg-[#F5F5DC] px-4 py-2 text-sm font-medium text-[#5D4128] transition hover:bg-[#EFE3C8]"
            >
              Войти в систему
            </Link>
          </div>
        </article>

        <aside className="rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Что важно помнить</h2>
          <ul className="mt-4 space-y-3 text-sm text-[#5D4128]">
            {articleRequirements.map((item) => (
              <li key={item} className="rounded-xl bg-[#F5F5DC] px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <div className="rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Разделы системы</h2>
            <p className="mt-1 text-sm text-[#6A4A2D]">
              Каждый маршрут соответствует отдельной рабочей роли.
            </p>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-[#734222] transition hover:text-[#8A4F29]"
          >
            Вернуться на главную
          </Link>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {systemRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="rounded-2xl border border-[#D8C8A8] bg-[#F5F5DC] p-5 transition hover:border-[#C7B288] hover:bg-[#EFE3C8]"
            >
              <h3 className="text-base font-semibold">{route.title}</h3>
              <p className="mt-2 text-sm text-[#6A4A2D]">{route.description}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          {roleInstructions.map((role) => (
            <article
              key={role.title}
              className="rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold">{role.title}</h2>
              <p className="mt-2 text-sm text-[#6A4A2D]">{role.summary}</p>
              <ol className="mt-4 space-y-2 text-sm text-[#5D4128]">
                {role.steps.map((step, index) => (
                  <li key={step} className="rounded-xl bg-[#F5F5DC] px-4 py-3">
                    {index + 1}. {step}
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>

        <div className="space-y-6">
          <article className="rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Общий процесс</h2>
            <div className="mt-4 space-y-3">
              {processStages.map((stage) => (
                <div
                  key={stage.title}
                  className="rounded-xl bg-[#F5F5DC] px-4 py-3"
                >
                  <h3 className="text-sm font-semibold">{stage.title}</h3>
                  <p className="mt-1 text-sm text-[#6A4A2D]">{stage.text}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-[#D8C8A8] bg-[#FDF9E8] p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Если что-то пошло не так</h2>
            <ul className="mt-4 space-y-3 text-sm text-[#5D4128]">
              {supportNotes.map((note) => (
                <li key={note} className="rounded-xl bg-[#F5F5DC] px-4 py-3">
                  {note}
                </li>
              ))}
            </ul>
            <Link
              href="/contact"
              className="mt-5 inline-flex rounded-full border border-[#C7B288] bg-[#F5F5DC] px-4 py-2 text-sm font-medium text-[#5D4128] transition hover:bg-[#EFE3C8]"
            >
              Открыть контакты
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
