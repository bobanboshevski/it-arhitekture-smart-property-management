import {Logger} from "@nestjs/common";
import {AppLogger} from "../../../shared/logger/logger.service";

export class SeasonalPricingRule {

    // private readonly logger = new AppLogger()
    private readonly logger = new Logger(SeasonalPricingRule.name)

    apply(basePrice: number, date: Date): number {

        const month = date.getMonth() + 1;
        this.logger.log(`Calculating seasonal price for month: ${month}`)

        if (month >= 6 && month <= 8) {
            return basePrice * 1.2;
        }

        // low season (jan, feb)
        if (month <= 2) {
            return basePrice * 0.8;
        }

        return basePrice
    }
}