package com.tcs.sign;

import org.apache.pdfbox.Loader;

import org.apache.pdfbox.io.RandomAccessReadBufferedFile;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.interactive.documentnavigation.destination.PDDestination;
import org.apache.pdfbox.pdmodel.interactive.documentnavigation.destination.PDPageDestination;
import org.apache.pdfbox.pdmodel.interactive.documentnavigation.destination.PDPageXYZDestination;
import org.apache.pdfbox.pdmodel.interactive.documentnavigation.outline.PDDocumentOutline;
import org.apache.pdfbox.pdmodel.interactive.documentnavigation.outline.PDOutlineItem;


import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class ExtractBookmarks {
    public static List<BookMark> extractBookmarks(File srcFile) throws IOException {
        //TIP Press <shortcut actionId="ShowIntentionActions"/> with your caret at the highlighted text
        // to see how IntelliJ IDEA suggests fixing it.
        // System.out.println("Hello and welcome!");

        //Loading an existing document

        PDDocument document = Loader.loadPDF(new RandomAccessReadBufferedFile(srcFile));
        List<BookMark> bookmarks = new ArrayList<>();
        PDDocumentOutline outline = document.getDocumentCatalog().getDocumentOutline();
        if (outline != null) {
            PDOutlineItem currentItem = outline.getFirstChild().getFirstChild();
            while (currentItem != null) {
                String bookmarkString = currentItem.getTitle();

                PDDestination destination = currentItem.getDestination();

                if (destination instanceof PDPageDestination){
                    PDPageDestination pageDestination = (PDPageDestination) destination;
                    PDPageXYZDestination pageXYZDestination = (PDPageXYZDestination) pageDestination;

                    BookMark bookMark = new BookMark(bookmarkString,  pageXYZDestination.getTop(),pageXYZDestination.getLeft(), 0);

                    bookmarks.add(bookMark);
                }
                currentItem = currentItem.getNextSibling();
            }
        }





        document.close();


        return bookmarks;
    }
    public static BookMark extractSpecificBookmark(File srcFile,String role) throws IOException {

        PDDocument document = Loader.loadPDF(new RandomAccessReadBufferedFile(srcFile));
        BookMark bookMark = null;
        PDDocumentOutline outline = document.getDocumentCatalog().getDocumentOutline();
        if (outline != null) {
            PDOutlineItem currentItem = outline.getFirstChild().getFirstChild();
            while (currentItem != null) {
                String bookmarkString = currentItem.getTitle();
                if(bookmarkString.toLowerCase().contains(role.toLowerCase()))
                {
                    PDDestination destination = currentItem.getDestination();

                    if (destination instanceof PDPageDestination){
                        PDPageDestination pageDestination = (PDPageDestination) destination;
                        PDPageXYZDestination pageXYZDestination = (PDPageXYZDestination) pageDestination;
                        PDPageDestination currentItemDestination = (PDPageDestination) currentItem.getDestination();
                        int pageNumber = currentItemDestination.retrievePageNumber();
                        if(pageNumber == -1 )
                        {
                            pageNumber =0;
                        }
                         bookMark = new BookMark(bookmarkString,  pageXYZDestination.getTop(),pageXYZDestination.getLeft(),pageNumber);
                        System.out.println("Inside Extract Bookmark function");
                         System.out.println(bookMark.toString());

                    }
                    break;
                }

                currentItem = currentItem.getNextSibling();
            }
        }




        document.close();


        return bookMark;

    }

    public static BookMark extractSpecificBookmarkFromByteArray(byte[] barr, String role) throws IOException {

        PDDocument document = Loader.loadPDF(barr);
        BookMark bookMark = null;
        PDDocumentOutline outline = document.getDocumentCatalog().getDocumentOutline();
        if (outline != null) {
            PDOutlineItem currentItem = outline.getFirstChild().getFirstChild();
            while (currentItem != null) {
                String bookmarkString = currentItem.getTitle();
                if(bookmarkString.toLowerCase().contains(role.toLowerCase()))
                {
                    PDDestination destination = currentItem.getDestination();

                    if (destination instanceof PDPageDestination){
                        PDPageDestination pageDestination = (PDPageDestination) destination;
                        PDPageXYZDestination pageXYZDestination = (PDPageXYZDestination) pageDestination;

                        PDPageDestination currentItemDestination = (PDPageDestination) currentItem.getDestination();
                        int pageNumber = currentItemDestination.retrievePageNumber();
                        System.out.println("Page Number"+pageNumber);
                        if(pageNumber == -1 )
                        {
                            pageNumber =0;
                        }
                        bookMark = new BookMark(bookmarkString,  pageXYZDestination.getTop(),pageXYZDestination.getLeft(),pageNumber);
                        System.out.println("Page Number extracted from bookmark object"+bookMark.getPageNumber());

                    }
                    break;
                }

                currentItem = currentItem.getNextSibling();
            }
        }




        document.close();


        return bookMark;

    }

}