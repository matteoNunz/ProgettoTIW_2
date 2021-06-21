package it.polimi.tiw.playlist.utils;

import java.io.File;
import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.Base64;

import javax.servlet.ServletContext;

import org.apache.commons.io.FileUtils;

import it.polimi.tiw.playlist.beans.User;
import it.polimi.tiw.playlist.dao.SongDAO;

public class GetEncoding {
	
	public static String getImageEncoding(String fileName , ServletContext context , Connection connection , User user) throws IOException {
		
		System.out.println("GetImage called, name of the song: " + fileName);
		
		String folderPath = context.getInitParameter("albumImgPath");
		SongDAO sDao = new SongDAO(connection);
		
		try {
			if(!sDao.findSongByUser(fileName, user.getId())) {
				return null;
			}
		}catch(SQLException e) {
			return null;
		}
		
		//Open the file
		File file = new File(folderPath, fileName);
		
		if (!file.exists() || file.isDirectory()) {
			return null;
		}
		
		System.out.println("Processing the base64 encoding for the image");
		
		//Take the byte array of the image
		byte[] fileContent = FileUtils.readFileToByteArray(file);
		//Take the base64 string
		String encodedString = Base64.getEncoder().encodeToString(fileContent);
		
		//Take the right type of each file (png , jpeg ...)
		encodedString = "data:" + context.getMimeType(fileName) + ";base64," + encodedString ;
		
		return encodedString;
	}
	
	public static String getSongEncoding(String fileName , ServletContext context , Connection connection , User user) throws IOException {
		
		System.out.println("GetSong called, name of the song: " + fileName);
		
		String folderPath = context.getInitParameter("songFilePath");
		SongDAO sDao = new SongDAO(connection);
		
		try {
			if(!sDao.findSongByUserId(fileName, user.getId())){
				return null;
			}
		}catch(SQLException e) {
			return null;
		}
		
		//Open the file
		File file = new File(folderPath, fileName);
		
		if (!file.exists() || file.isDirectory()) {
			return null;
		}
		
		System.out.println("Processing the base64 encoding for the song");
		
		//Take the byte array of the image
		byte[] fileContent = FileUtils.readFileToByteArray(file);
		//Take the base64 string
		String encodedString = Base64.getEncoder().encodeToString(fileContent);
		
		//Take the right type of the file (mp3)
		encodedString = "data:" + context.getMimeType(fileName) + ";base64," + encodedString ;
		
		return encodedString;
	}
}