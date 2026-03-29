import {Injectable, LoggerService} from '@nestjs/common';

@Injectable()
export class AppLogger implements LoggerService {
    log(message: string, context?: string) {
        console.log(`[LOG] [${context}] ${message}`);
    }

    error(message: string, trace?: string, context?: string) {
        console.error(`[ERROR] [${context}] ${message}`, trace);
    }

    warn(message: string, context?: string) {
        console.warn(`[WARN] [${context}] ${message}`);
    }

    debug(message: string, context?: string) {
        console.debug(`[DEBUG] [${context}] ${message}`);
    }

    verbose(message: string, context?: string) {
        console.info(`[VERBOSE] [${context}] ${message}`);
    }
}