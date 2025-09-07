import CodeEntropyAnalyzer from '@/components/CodeEntropyAnalyzer';

export default function EntropyPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Анализатор энтропии JavaScript кода</h1>
      <CodeEntropyAnalyzer />
    </div>
  );
}
