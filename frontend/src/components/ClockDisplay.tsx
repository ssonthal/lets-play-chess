const formatTime = (t: number) =>
    `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;

export function ClockDisplay({
    time,
    label,
    isActive,
}: {
    time: number;
    label: string;
    isActive?: boolean;
}) {
    return (
        <div
            className={`w-[200px] h-[60px] flex items-center justify-between px-6 py-2 rounded shadow text-xl font-mono text-white 
            ${isActive ? "bg-green-700" : "bg-gray-700"}`}
        >
            <span>{label}:</span>
            <span>{formatTime(time)}</span>
        </div>
    );
}
