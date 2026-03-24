import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Headers,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private auditLogsService: AuditLogsService,
  ) { }

  @Post()
  async create(@Body() createUserDto: any) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll() {
    try {
      return await this.usersService.findAll();
    } catch (error) {
      console.error('Erreur dans findAll:', error);
      throw error;
    }
  }

  @Get('cin/:cin')
  async findByCin(@Param('cin') cin: string) {
    try {
      return await this.usersService.findByCin(cin);
    } catch (error) {
      console.error('Erreur dans findByCin:', error);
      throw error;
    }
  }

  @Get('mypermissions')
  async getProfile(@Headers('Authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'No token provided' };
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded: any = this.jwtService.verify(token);
      const userId = decoded.sub;
      return this.usersService.mypermission(userId);
    } catch (error) {
      return { error: 'Invalid token' };
    }
  }

  @Get('pending')
  async findPending() {
    return this.usersService.findPending();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: any, @Req() req: any) {
    const updated = await this.usersService.update(id, updateUserDto);
    await this.auditLogsService.createLog({
      userId: String(req?.user?.sub || ''),
      actionType: 'update',
      actionLabel: 'Updated user record',
      resourceType: 'user',
      resourceId: id,
      severity: 'important',
      ipAddress: req?.ip,
    });
    return updated;
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const deleted = await this.usersService.remove(id);
    await this.auditLogsService.createLog({
      userId: String(req?.user?.sub || ''),
      actionType: 'delete',
      actionLabel: 'Deleted user record',
      resourceType: 'user',
      resourceId: id,
      severity: 'critical',
      ipAddress: req?.ip,
    });
    return deleted;
  }

  @Put('ban/:id')
  async ban(@Param('id') id: string, @Req() req: any) {
    const user = await this.usersService.handleBan(id);
    await this.auditLogsService.createLog({
      userId: String(req?.user?.sub || ''),
      actionType: 'update',
      actionLabel: 'Toggled user active status',
      resourceType: 'user',
      resourceId: id,
      severity: 'important',
      ipAddress: req?.ip,
    });
    return user;
  }
}

