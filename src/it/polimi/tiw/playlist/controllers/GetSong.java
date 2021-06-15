package it.polimi.tiw.playlist.controllers;

import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URLDecoder;
import java.nio.file.Files;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.UnavailableException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import it.polimi.tiw.playlist.beans.User;
import it.polimi.tiw.playlist.dao.SongDAO;
import it.polimi.tiw.playlist.utils.ConnectionHandler;

@WebServlet("/GetSong/*")
public class GetSong extends HttpServlet{
	
	private static final long serialVersionUID = 1L;
	String folderPath = "";
	private Connection connection;
	
	public void init() {
		folderPath = getServletContext().getInitParameter("songFilePath");
		
		try {
			connection = ConnectionHandler.getConnection(getServletContext());
		} catch (UnavailableException e) {
			e.printStackTrace();
		}
	}
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException{
		
		//Take the pathInfo from the request
		String pathInfo = request.getPathInfo();
		
		HttpSession s = request.getSession();
		User user = (User) s.getAttribute("user");
		
		//Check if the path info is valid
		if (pathInfo == null || pathInfo.equals("/")) {
			//Set an error and return nothing
			return;
		}
		
		//Take the fileName from the pathInfo without the "/" character
		String filename = URLDecoder.decode(pathInfo.substring(1), "UTF-8");
		
		System.out.println("GetSong called, name of the song: " + filename);
		

		SongDAO sDao = new SongDAO(connection);
		
		try {
			if(!sDao.findSongByUserId(filename, user.getId())) {
				return;
			}
		}catch(SQLException e) {
			//Error
			return;
		}
		
		//Open the file
		File file = new File(folderPath, filename);
		
		if (!file.exists() || file.isDirectory()) {
			//Set an error
			return;
		}
		
		response.setStatus(HttpServletResponse.SC_OK);//Code 200
		
		//Set headers for browser
		response.setHeader("Content-Type", getServletContext().getMimeType(filename));
		response.setHeader("Content-Length", String.valueOf(file.length()));
		
		//inline     -> the user will watch the image immediately
		//attachment -> the user has to do something to watch the image
		//filename   -> used to indicate a fileName if the user wants to save the file
		response.setHeader("Content-Disposition", "inline; filename=\"" + file.getName() + "\"");
		
		//Copy the file to the output stream
		Files.copy(file.toPath(), response.getOutputStream());
	}
	
	public void destroy() {
		try {
			ConnectionHandler.closeConnection(connection);
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
}
