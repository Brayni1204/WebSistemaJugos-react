"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComment = exports.getCommentsForPage = void 0;
const prisma_1 = __importDefault(require("@/config/prisma"));
// GET /api/comments/:pageType/:pageId
const getCommentsForPage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { pageType, pageId } = req.params;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!tenantId) {
        return res.status(400).json({ message: 'Tenant ID is missing.' });
    }
    try {
        const allComments = yield prisma_1.default.pageComment.findMany({
            where: {
                tenantId,
                pageType,
                pageId: Number(pageId),
                status: 'APPROVED',
            },
            include: {
                user: {
                    select: { name: true, profile_photo_path: true }
                }
            },
            orderBy: { createdAt: 'asc' },
        });
        const commentsById = new Map(allComments.map(comment => [comment.id, Object.assign(Object.assign({}, comment), { children: [] })]));
        const rootComments = [];
        for (const comment of commentsById.values()) {
            if (comment.parentId && commentsById.has(comment.parentId)) {
                const parent = commentsById.get(comment.parentId);
                if (parent) {
                    parent.children.push(comment);
                }
            }
            else {
                rootComments.push(comment);
            }
        }
        res.status(200).json(rootComments);
    }
    catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ message: 'Failed to fetch comments.' });
    }
});
exports.getCommentsForPage = getCommentsForPage;
// POST /api/comments/:pageType/:pageId
const createComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { pageType, pageId } = req.params;
    const { content, parentId } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const tenantId = (_b = req.tenant) === null || _b === void 0 ? void 0 : _b.id;
    if (!userId || !tenantId) {
        return res.status(400).json({ message: 'User or Tenant ID is missing.' });
    }
    if (!content) {
        return res.status(400).json({ message: 'Comment content cannot be empty.' });
    }
    try {
        const newComment = yield prisma_1.default.pageComment.create({
            data: {
                content,
                pageType,
                pageId: Number(pageId),
                parentId: parentId ? Number(parentId) : null,
                userId,
                tenantId,
            },
            include: {
                user: {
                    select: { name: true, profile_photo_path: true }
                }
            }
        });
        res.status(201).json(newComment);
    }
    catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).json({ message: 'Failed to create comment.' });
    }
});
exports.createComment = createComment;
