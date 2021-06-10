package it.polimi.tiw.playlist.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.ArrayList;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.UnavailableException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.WebContext;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ServletContextTemplateResolver;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import it.polimi.tiw.playlist.beans.Playlist;
import it.polimi.tiw.playlist.beans.User;
import it.polimi.tiw.playlist.dao.PlaylistDAO;
import it.polimi.tiw.playlist.utils.ConnectionHandler;

@WebServlet("/GetPlaylistList")
public class GetPlaylistList extends HttpServlet {

	private static final long serialVersionUID = 1L;
	private Connection connection;
	
	public void init() {
		ServletContext context = getServletContext();
		
		try {
			connection = ConnectionHandler.getConnection(context);
		} catch (UnavailableException e) {
			e.printStackTrace();
		}
	}
	
	public void doGet(HttpServletRequest request , HttpServletResponse response)throws ServletException,IOException{
		
		//Take the user from the session
		HttpSession s = request.getSession();
		User user = (User) s.getAttribute("user");
		ArrayList<Playlist> playlists = null;
		String error = "";
		String error1 = "";
		String error2 = "";
		
		System.out.println("Getting the playlist list");
		
		PlaylistDAO pDao = new PlaylistDAO(connection);
		
		//!!!!!!!!!!!!Maybe useless!!!!!!!!!!!!!!!!!!!
		//In case of forward from CreatePlaylist , CreateSong and GoToPlayistPage 
		if(((String) request.getAttribute("error")) != null) 
			error = (String) request.getAttribute("error");
		else if(((String) request.getAttribute("error1")) != null) 
			error1 = (String) request.getAttribute("error1");
		else if(((String) request.getAttribute("error2")) != null) //from GoToPlaylistPage
			error2 = (String) request.getAttribute("error2");
		
		
		try {
			playlists = pDao.findPlaylist(user.getId());
		}catch(SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);//Code 500
			response.getWriter().println("Internal server error, retry later");
			return;
		}
		
		response.setStatus(HttpServletResponse.SC_OK);//Code 200
		
		//Create the jSon with the answer
		Gson gSon = new GsonBuilder().setDateFormat("dd-MM-yyyy").create();
		String jSon = gSon.toJson(playlists);
		
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.getWriter().write(jSon);
	}
	
	public void doPost(HttpServletRequest request , HttpServletResponse response)throws ServletException,IOException{
		doGet(request , response);
	}
	
	
	public void destroy() {
		try {
			ConnectionHandler.closeConnection(connection);
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
	
	
}
















