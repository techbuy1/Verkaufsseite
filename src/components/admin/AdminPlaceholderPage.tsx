interface AdminPlaceholderPageProps {
  title: string;
  description: string;
}

export function AdminPlaceholderPage({ title, description }: AdminPlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-[700px]">
      <h1 className="admin-page-title">{title}</h1>
      <p className="admin-page-subtitle">{description}</p>
      <div className="admin-panel mt-8 p-8 text-center">
        <p className="text-[14px] text-text-secondary">
          Dieser Bereich ist vorbereitet und wird mit der Datenbank-Anbindung erweitert.
        </p>
      </div>
    </div>
  );
}
