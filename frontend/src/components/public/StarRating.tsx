// src/components/public/StarRating.tsx
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
    rating: number;
    onRatingChange?: (newRating: number) => void;
    editable?: boolean;
    size?: number;
}

export const StarRating = ({ rating, onRatingChange, editable = false, size = 5 }: StarRatingProps) => {
    return (
        <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={cn(
                        'transition-colors',
                        i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/50',
                        editable ? 'cursor-pointer hover:text-yellow-300' : ''
                    )}
                    onClick={() => editable && onRatingChange && onRatingChange(i + 1)}
                    size={size}
                />
            ))}
        </div>
    );
};
