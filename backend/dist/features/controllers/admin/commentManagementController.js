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
exports.deleteComment = exports.updateCommentStatus = exports.listComments = void 0;
const prisma_1 = __importDefault(require("@/config/prisma"));
// Workaround for prisma generate issue
var CommentStatus;
(function (CommentStatus) {
    CommentStatus["PENDING"] = "PENDING";
    CommentStatus["APPROVED"] = "APPROVED";
    CommentStatus["REJECTED"] = "REJECTED";
})(CommentStatus || (CommentStatus = {}));
// GET /api/admin/comments
const listComments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const comments = yield prisma_1.default.pageComment.findMany({
            where: { tenantId },
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(comments);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch comments.' });
    }
});
exports.listComments = listComments;
// PATCH /api/admin/comments/:commentId/status
const updateCommentStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { commentId } = req.params;
    const { status } = req.body;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    if (!Object.values(CommentStatus).includes(status)) {
        return res.status(400).json({ message: 'Invalid status value.' });
    }
    try {
        const comment = yield prisma_1.default.pageComment.findFirst({
            where: { id: Number(commentId), tenantId },
        });
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }
        const updatedComment = yield prisma_1.default.pageComment.update({
            where: { id: Number(commentId) },
            data: { status },
        });
        res.status(200).json(updatedComment);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update comment status.' });
    }
});
exports.updateCommentStatus = updateCommentStatus;
// DELETE /api/admin/comments/:commentId
const deleteComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { commentId } = req.params;
    const tenantId = (_a = req.tenant) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const comment = yield prisma_1.default.pageComment.findFirst({
            where: { id: Number(commentId), tenantId },
        });
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }
        yield prisma_1.default.pageComment.delete({
            where: { id: Number(commentId) },
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to delete comment.' });
    }
});
exports.deleteComment = deleteComment;
