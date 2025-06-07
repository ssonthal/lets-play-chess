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
            className={`text-white px-6 py-2 rounded shadow text-xl font-mono ${isActive ? "bg-green-700" : "bg-gray-700"
                }`}
        >
            {label}: {formatTime(time)}
        </div>
    );
}
