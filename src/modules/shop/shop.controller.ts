import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ShopService } from './shop.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

@ApiTags('Shop')
@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get('products')
  getProducts() {
    return this.shopService.getProducts();
  }

  @Get('products/:slug')
  getProduct(@Param('slug') slug: string) {
    return this.shopService.getProduct(slug);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('orders')
  createOrder(@CurrentUser() user: any, @Body() dto: CreateOrderDto) {
    return this.shopService.createOrder(user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('orders/my')
  getMyOrders(@CurrentUser() user: any) {
    return this.shopService.getMyOrders(user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('orders/:id')
  getOrderById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.shopService.getOrderById(user.id, id);
  }

  // --- ADMIN ROUTES ---
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('admin/orders')
  getAdminOrders(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit: number,
    @Query('status') status?: any,
    @Query('search') search?: string,
  ) {
    return this.shopService.getAdminOrders(page, limit, status, search);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('admin/orders/:id')
  getAdminOrderDetail(@Param('id') id: string) {
    return this.shopService.getAdminOrderDetail(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Patch('admin/orders/:id/status')
  updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.shopService.updateOrderStatus(id, dto);
  }
}
