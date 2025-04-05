'use client';

interface ProgressBarProps {
    progress: number;
    label?: string;
    showPercentage?: boolean;
    className?: string;
}

export default function ProgressBar({
    progress,
    label,
    showPercentage = true,
    className = '',
}: ProgressBarProps) {
    // Ensure progress is between 0 and 100
    const normalizedProgress = Math.max(0, Math.min(100, progress));

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    {showPercentage && (
                        <span className="text-sm font-medium text-gray-700">{normalizedProgress}%</span>
                    )}
                </div>
            )}
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                    style={{ width: `${normalizedProgress}%` }}
                ></div>
            </div>
        </div>
    );
}