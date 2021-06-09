package it.polimi.tiw.playlist.controllers;

import java.sql.Date;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.thymeleaf.TemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ServletContextTemplateResolver;

import it.polimi.tiw.playlist.beans.User;
import it.polimi.tiw.playlist.dao.PlaylistDAO;


@WebServlet("/CreatePlaylist")
public class CreatePlaylist extends HttpServlet{

	private static final long serialVersionUID = 1L;
	private Connection connection;
	private TemplateEngine templateEngine;
	
	public void init() {
		try {
			ServletContext context = getServletContext();
			
			//Initializing the template engine
			ServletContextTemplateResolver templateResolver = new ServletContextTemplateResolver(context);
			templateResolver.setTemplateMode(TemplateMode.HTML);
			this.templateEngine = new TemplateEngine();
			this.templateEngine.setTemplateResolver(templateResolver);
			templateResolver.setSuffix(".html");
			
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
	
	public void doPost(HttpServletRequest request , HttpServletResponse response)throws ServletException,IOException{
		String title = request.getParameter("title");
		Date creationDate = new Date(System.currentTimeMillis());
		String error = "";

		HttpSession s = request.getSession();
		User user = (User) s.getAttribute("user");
		if (s.isNew() || user == null) {
			response.sendRedirect("/TIW-PlayList-HTML-Pure/login.html");
			return;
		}
		
		if(title == null || title.isEmpty())
			error += "Title is empty";
		else if(title.length() > 45)
			error += "Title is too long";
		if(!error.equals("")){
			request.getSession().setAttribute("error", error);
			String path = getServletContext().getContextPath() + "/GoToHomePage";
			
			RequestDispatcher dispatcher = getServletContext().getRequestDispatcher(path);
			dispatcher.forward(request,response);
		}
		
		PlaylistDAO pDao = new PlaylistDAO(connection);
		
		try {
			boolean result = pDao.createPlaylist(title, creationDate , user.getId());
			
			if(result == true) {
				String path = getServletContext().getContextPath() + "/GoToHomePage";
				response.sendRedirect(path);
			}
			else {
				error += "Title " + title + " is already used";
				request.setAttribute("error", error);
				String path = "/GoToHomePage";

				RequestDispatcher dispatcher = getServletContext().getRequestDispatcher(path);
				dispatcher.forward(request,response);
			}
		}catch(SQLException e) {
			e.printStackTrace();
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Issue with DB!!!!!");
		}
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







