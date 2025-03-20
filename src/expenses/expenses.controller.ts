import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
    Req,
    UnauthorizedException,
} from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ExpensesService } from './expenses.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
    constructor(private readonly expensesService: ExpensesService) { }

    @Post()
    createExpense(@Body() createExpenseDto: CreateExpenseDto, @Req() req: Request) {
        if (!req.user) {
            throw new UnauthorizedException('User not authenticated');
        }
        return this.expensesService.createExpense(createExpenseDto, req.user['userId']);
    }


    @Get()
    findAllExpenses(@Query() queryExpenseDto: QueryExpenseDto, @Req() req: Request) {
        if (!req.user) {
            throw new UnauthorizedException('User not authenticated');
        }
        return this.expensesService.findAllExpenses(queryExpenseDto, req.user['userId']);
    }


    @Get('daily-summary')
    getDailySummary(@Req() req: Request) {
        if (!req.user) {
            throw new UnauthorizedException('User not authenticated');
        }
        return this.expensesService.getDailySummary(req.user['userId']);
    }

    @Get(':id')
    findOneExpense(@Param('id') id: string, @Req() req: Request) {
        if (!req.user) {
            throw new UnauthorizedException('User not authenticated');
        }
        return this.expensesService.findOneExpense(id, req.user['userId']);
    }

    @Patch(':id')
    updateExpense(
        @Param('id') id: string,
        @Body() updateExpenseDto: UpdateExpenseDto,
        @Req() req: Request,
    ) {
        if (!req.user) {
            throw new UnauthorizedException('User not authenticated');
        }
        return this.expensesService.updateExpense(id, updateExpenseDto, req.user['userId']);
    }

    @Delete(':id')
    removeExpense(@Param('id') id: string, @Req() req: Request) {
        if (!req.user) {
            throw new UnauthorizedException('User not authenticated');
        }
        return this.expensesService.removeExpense(id, req.user['userId']);
    }

    @Post('categories')
    createCategory(@Body() createCategoryDto: CreateCategoryDto, @Req() req: Request) {
        if (!req.user) {
            throw new UnauthorizedException('User not authenticated');
        }
        return this.expensesService.createCategory(createCategoryDto, req.user['userId']);
    }

    @Get('categories')
    findAllCategories(@Req() req: Request) {
        if (!req.user) {
            throw new UnauthorizedException('User not authenticated');
        }
        return this.expensesService.findAllCategories(req.user['userId']);
    }

    @Delete('categories/:id')
    removeCategory(@Param('id') id: string, @Req() req: Request) {
        if (!req.user) {
            throw new UnauthorizedException('User not authenticated');
        }
        return this.expensesService.removeCategory(id, req.user['userId']);
    }

    @Post('generate-monthly-report')
    generateMonthlyReport(@Req() req: Request) {
        if (!req.user) {
            throw new UnauthorizedException('User not authenticated');
        }
        return this.expensesService.generateMonthlyReport(req.user['userId']);
    }
}