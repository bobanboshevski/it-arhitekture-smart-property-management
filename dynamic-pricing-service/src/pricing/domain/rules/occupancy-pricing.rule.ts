export class OccupancyPricingRule {
    apply(price: number, occupancyRate: number): number {

        if (occupancyRate > 0.8) {
            return price * 1.15;
        }

        if (occupancyRate < 0.3) {
            return price * 0.9;
        }

        return price;
    }
}