import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBadge } from './StatusBadge'; // นำเข้า Component ที่เราจะเทส

describe('StatusBadge Component', () => {

    it('renders correctly with success variant', () => {
        render(<StatusBadge variant="success">In Stock</StatusBadge>)
        const badge = screen.getByText('In Stock');
        expect(badge).toBeInTheDocument();

    });

    it('applies danger styling when variant is danger', () => {
        render(<StatusBadge variant="danger">Out of Stock</StatusBadge>)
        const badge = screen.getByText('Out of Stock');
        expect(badge.className).toContain('text-destructive');
    });
});
