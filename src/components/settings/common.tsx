export function basicPage(
  title: string,
  description: React.ReactNode,
  children: React.ReactNode,
) {
  return (
    <>
      <div className="rounded-lg shadow-lg bg-white p-4">
        <h2 className="text-xl w-full">{title}</h2>
        <p className="w-full my-4">{description}</p>

        <div className="mt-4">
          {children}
        </div>
      </div>
    </>
  );
}

export function BasicPage({
  title,
  description,
  children,
}: {
  title: string,
  description: React.ReactNode,
  children: React.ReactNode,
}) {
  return (
    <>
      <div className="rounded-lg shadow-lg bg-white p-4">
        <h2 className="text-xl w-full">{title}</h2>
        <p className="w-full my-4">{description}</p>

        <div className="mt-4">
          {children}
        </div>
      </div>
    </>
  );
}


export function FormRow({label, children}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="sm:col-span-3 max-w-xs rounded-xl">
      <label htmlFor="last-name" className="block text-sm font-medium leading-6 text-gray-900">
        {label}
      </label>
      <div className="mt-2">
        {children}
      </div>
    </div>
  );
}

export function basename(path: string) {
  const a = path.split("/");
  return a[a.length - 1];
}

export function thumbPrefix(path: string) {
  const a = path.split("/");
  a[a.length - 1] = "thumb-" + a[a.length - 1];
  return a.join("/");
}

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}
