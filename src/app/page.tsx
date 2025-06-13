import Header from './header/header';
import CodingTest from './main/codingTest';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="grid place-items-center bg-black-500 text-white p-4">
        <Header />
      </header>
      <div className="flex flex-1">
        <aside className="w-64 bg-gray-200 p-4 hidden md:block text-black">Левая панель</aside>
        <main className="flex-1 bg-white p-4">
          <CodingTest />
        </main>
        <aside className="w-64 bg-gray-200 p-4 hidden lg:block text-black">Правая панель</aside>
      </div>
      <footer className="grid place-items-center bg-blue-500 text-white p-4">Подвал сайта</footer>
    </div>
  );
}
