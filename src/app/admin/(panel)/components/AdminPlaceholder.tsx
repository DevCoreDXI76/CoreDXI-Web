type AdminPlaceholderProps = {
  title: string;
  description: string;
};

export function AdminPlaceholder({ title, description }: AdminPlaceholderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-gray-500">{description}</p>
      <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-sm text-gray-400">
        이 메뉴는 곧 콘텐츠 편집 기능이 연결됩니다.
      </div>
    </div>
  );
}
