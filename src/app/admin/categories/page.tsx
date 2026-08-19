function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto max-w-[700px]">
      <h1 className="text-[28px] font-bold tracking-tight text-[#1d1d1f]">{title}</h1>
      <p className="mt-2 text-[15px] text-[#6e6e73]">{description}</p>
      <div className="mt-8 rounded-[18px] border border-[#d2d2d7]/40 bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <p className="text-[14px] text-[#6e6e73]">
          Dieser Bereich ist vorbereitet und wird mit der Datenbank-Anbindung erweitert.
        </p>
      </div>
    </div>
  );
}

export default function AdminCategoriesPage() {
  return (
    <PlaceholderPage
      title="Kategorien"
      description="Shop-Kategorien verwalten — folgt mit Backend."
    />
  );
}
