export const UserText = ({ message }: { message: string }) => {
  return (
    <div className="absolute bottom-0 left-0 mb-104  w-full">
      <div className="mx-auto max-w-4xl w-full p-16">
        <div className="bg-white rounded-lg">
          <div className="px-8 py-4 bg-primary rounded-t-lg text-white font-bold tracking-wider">
            YOU
          </div>
          <div className="px-8 py-4 max-h-32 overflow-y-auto">
            <div className="min-h-8 max-h-full text-primary typography-16 font-bold">
              {message.replace(/\[([a-zA-Z]*?)\]/g, "")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
