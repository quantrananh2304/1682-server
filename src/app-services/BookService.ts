import { injectable } from "inversify";
import { IBookService } from "./interface";
import Books, { BookModelInterface } from "@app-repositories/models/Books";
import { Types } from "mongoose";

@injectable()
class BookService implements IBookService {
  async createBook(
    _book: {
      title: string;
      chapters: { name: string; content: string }[];
      topics: string[];
    },
    actor: string
  ): Promise<BookModelInterface> {
    const { title, chapters, topics } = _book;
    const book: BookModelInterface = await Books.create({
      title,
      chapters: chapters.map((item) => ({ ...item, createdAt: new Date() })),
      like: [],
      dislike: [],
      views: [],
      comments: [],
      topics,
      subscribedUsers: [],
      hidden: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: Types.ObjectId(actor),
    });

    return book;
  }

  async getBookById(_id: string): Promise<BookModelInterface> {
    const book: BookModelInterface = await Books.findById(_id)
      .select("-__v")
      .populate("topics")
      .populate({ path: "updatedBy", select: "firstName lastName _id" });

    return book;
  }
}

export default BookService;
