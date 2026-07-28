interface Props {
  count: number;
}

export default function ChatUnreadBadge({ count }: Props) {
  if (count <= 0) return null;
  return (
    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-[10px] font-bold text-white flex items-center justify-center">
      {count > 99 ? '99+' : count}
    </span>
  );
}
