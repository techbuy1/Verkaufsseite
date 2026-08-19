export default function ProductRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-[72px]">{children}</div>
  );
}
