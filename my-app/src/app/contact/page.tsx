export const metadata = {
  title: "Контакты",
  description: "Как с нами связаться",
};

export default function ContactPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Контакты</h1>
      <p>Напишите нам: artur251373@gmail.com</p>
      <p>
        Желательно прикрепить скриншот вашей проблемы, чтобы мы могли быстрее
        помочь вам, если у вас возникли какие-либо вопросы или проблемы.
      </p>
    </section>
  );
}
