package it.polimi.tiw.playlist.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.ArrayList;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.WebContext;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ServletContextTemplateResolver;

import it.polimi.tiw.playlist.beans.Playlist;
import it.polimi.tiw.playlist.beans.User;
import it.polimi.tiw.playlist.dao.PlaylistDAO;

@WebServlet("/GoToHomePage")
public class GoToHomePage extends HttpServlet {

	private static final long serialVersionUID = 1L;
	private Connection connection;
	private TemplateEngine templateEngine;
	
	public void init() {
		ServletContext context = getServletContext();
		
		//Initializing the template engine
		ServletContextTemplateResolver templateResolver = new ServletContextTemplateResolver(context);
		templateResolver.setTemplateMode(TemplateMode.HTML);
		this.templateEngine = new TemplateEngine();
		this.templateEngine.setTemplateResolver(templateResolver);
		templateResolver.setSuffix(".html");
		
		try {
			
			//Initializing the connection
			String driver = context.getInitParameter("dbDriver");
			String url = context.getInitParameter("dbUrl");
			String user = context.getInitParameter("dbUser");
			String password = context.getInitParameter("dbPassword");
			
			Class.forName(driver);
			connection = DriverManager.getConnection(url , user , password);
		}catch(ClassNotFoundException e) {
			e.printStackTrace();
		}catch(SQLException e) {
			e.printStackTrace();
		}
	}
	
	public void doGet(HttpServletRequest request , HttpServletResponse response)throws ServletException,IOException{
		//Need to take the user from the session and make the control
		HttpSession s = request.getSession();
		User user = (User) s.getAttribute("user");
		ArrayList<Playlist> playlists = null;
		String error = "";
		String error1 = "";
		String error2 = "";
		
		//Check if the session is valid
		if (s.isNew() || user == null) {
			response.sendRedirect("/TIW-PlayList-HTML-Pure/login.html");
			return;
		}
		
		PlaylistDAO pDao = new PlaylistDAO(connection);
		
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
			response.sendError(HttpServletResponse.SC_BAD_GATEWAY, "Failure in database extraction");
		}
		
		String path = "/WEB-INF/HomePage.html";
		ServletContext servletContext = getServletContext();
		final WebContext ctx = new WebContext(request , response , servletContext , request.getLocale());
		ctx.setVariable("playlists" , playlists);
		ctx.setVariable("user", user);
		ctx.setVariable("errorMsg", error);
		ctx.setVariable("errorMsg1", error1);
		ctx.setVariable("errorMsg2", error2);
		templateEngine.process(path , ctx , response.getWriter());
	}
	
	public void doPost(HttpServletRequest request , HttpServletResponse response)throws ServletException,IOException{
		doGet(request , response);
	}
	
	
	
	public void destroy() {
		try {
			if (connection != null) {
				connection.close();
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
	
	
}
















