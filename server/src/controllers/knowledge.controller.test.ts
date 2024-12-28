import { Request, Response, NextFunction } from 'express';
import { createMockContext } from '../test/setup';
import { PrismaClient } from '@prisma/client';
import { DeepMockProxy } from 'jest-mock-extended';
import { createKnowledgeBase, importEntries } from './knowledge.controller';

describe('Knowledge Controller', () => {
  let mockPrisma: DeepMockProxy<PrismaClient>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock<NextFunction>;

  beforeEach(() => {
    const context = createMockContext();
    mockPrisma = context.prisma;
    mockNext = jest.fn();
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockReq = {
      body: {
        name: 'Test Knowledge Base',
        description: 'Test Description',
        sourceLanguage: 'en',
        targetLanguage: 'es',
        entries: [
          { sourceText: 'hello', targetText: 'hola' },
          { sourceText: 'world', targetText: 'mundo' },
        ],
      },
      user: { id: '1' },
    } as any;
  });

  describe('createKnowledgeBase', () => {
    it('should create a new knowledge base with entries', async () => {
      const mockKnowledgeBase = {
        id: '1',
        name: 'Test Knowledge Base',
        description: 'Test Description',
        sourceLanguage: 'en',
        targetLanguage: 'es',
        userId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        entries: [
          { 
            id: '1',
            sourceText: 'hello',
            targetText: 'hola',
            knowledgeBaseId: '1',
            createdAt: new Date(),
            context: null,
            category: null
          },
          { 
            id: '2',
            sourceText: 'world',
            targetText: 'mundo',
            knowledgeBaseId: '1',
            createdAt: new Date(),
            context: null,
            category: null
          },
        ],
      };

      mockPrisma.knowledgeBase.create.mockResolvedValue(mockKnowledgeBase);

      await createKnowledgeBase(mockReq as Request, mockRes as Response, mockNext);

      expect(mockPrisma.knowledgeBase.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Test Knowledge Base',
          description: 'Test Description',
          sourceLanguage: 'en',
          targetLanguage: 'es',
          userId: '1',
        }),
        include: {
          entries: true,
        },
      });

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockKnowledgeBase,
      });
    });

    it('should handle validation errors', async () => {
      const error = new Error('Validation error');
      mockPrisma.knowledgeBase.create.mockRejectedValue(error);

      await createKnowledgeBase(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      
      jest.mock('../database', () => ({
        knowledgeBase: {
          create: jest.fn(),
          update: jest.fn(),
        },
      }));
    });
  });

  describe('importEntries', () => {
    it('should import entries from CSV', async () => {
      const mockFile = {
        buffer: Buffer.from('sourceText,targetText\nhello,hola\nworld,mundo'),
        mimetype: 'text/csv',
      };

      mockReq = {
        file: mockFile as Express.Multer.File,
        params: {
          id: '1',
        },
      };

      const mockUpdatedKnowledgeBase = {
        id: '1',
        name: 'Test Knowledge Base',
        description: 'Test Description',
        sourceLanguage: 'en',
        targetLanguage: 'es',
        userId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        entries: [
          { 
            id: '1',
            sourceText: 'hello',
            targetText: 'hola',
            knowledgeBaseId: '1',
            createdAt: new Date(),
            context: null,
            category: null
          },
          { 
            id: '2',
            sourceText: 'world',
            targetText: 'mundo',
            knowledgeBaseId: '1',
            createdAt: new Date(),
            context: null,
            category: null
          },
        ],
      };

      mockPrisma.knowledgeBase.update.mockResolvedValue(mockUpdatedKnowledgeBase);

      await importEntries(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockUpdatedKnowledgeBase,
      });
    });


    it('should handle invalid CSV format', async () => {
      const mockFile = {
        buffer: Buffer.from('invalid,csv,format'),
        mimetype: 'text/csv',
      };

      mockReq = {
        file: mockFile as Express.Multer.File,
        params: {
          id: '1',
        },
      };

      await importEntries(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new Error('Invalid CSV format'));
    });
  });
});
