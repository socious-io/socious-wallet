const Tag: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 inline-block border-gray-300 border py-1 px-3 rounded-full text-gray-700 dark:text-gray-300">
      {text}
    </div>
  );
};

export default Tag;
