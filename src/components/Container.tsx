const Container = ({children}:{children: React.ReactNode}) => {
  return (
        <div className="max-w-[1920] w-full mx-auto xl:px-20 px-4 py-4">
            {children}
        </div>
    );
};

export default Container;
