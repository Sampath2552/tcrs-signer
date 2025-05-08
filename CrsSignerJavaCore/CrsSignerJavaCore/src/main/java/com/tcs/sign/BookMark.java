package com.tcs.sign;

public class BookMark
{
    private String bookmarkName;
    private int x;
    private int y;
    private int pageNumber;
    public BookMark(String bookmarkName, int x, int y, int pageNumber) {
        this.bookmarkName = bookmarkName;
        this.x = x;
        this.y = y;
        this.pageNumber = pageNumber;
    }

    public String getBookmarkName() {
        return bookmarkName;
    }

    public void setBookmarkName(String bookmarkName) {
        this.bookmarkName = bookmarkName;
    }

    public int getX() {
        return x;
    }

    public void setX(int x) {
        this.x = x;
    }

    public int getY() {
        return y;
    }

    public void setY(int y) {
        this.y = y;
    }

    public int getPageNumber() {
        return pageNumber;
    }

    public void setPageNumber(int pageNumber) {
        this.pageNumber = pageNumber;
    }

    @Override
    public String toString() {
        return "BookMark{" +
                "bookmarkName='" + bookmarkName + '\'' +
                ", x=" + x +
                ", y=" + y +
                '}';
    }
}
