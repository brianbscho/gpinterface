export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="w-full max-w-7xl flex flex-col gap-3 px-3">
      <div className="text-xl font-bold mt-12">Usages</div>
      {children}
    </div>
  );
}
