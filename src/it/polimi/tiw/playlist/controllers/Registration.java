package it.polimi.tiw.playlist.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.WebContext;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ServletContextTemplateResolver;

import it.polimi.tiw.playlist.dao.UserDAO;

@WebServlet("/Registration")
public class Registration extends HttpServlet{
	private static final long serialVersionUID = 1L;
	private Connection connection;
	private TemplateEngine templateEngine;
	
	public Registration() {
		super();
	}
	
	public void init() {
		ServletContext context = getServletContext();
		
		ServletContextTemplateResolver templateResolver = new ServletContextTemplateResolver(context);
		templateResolver.setTemplateMode(TemplateMode.HTML);
		this.templateEngine = new TemplateEngine();
		this.templateEngine.setTemplateResolver(templateResolver);
		templateResolver.setSuffix(".html");
		
		try {			
			String driver = context.getInitParameter("dbDriver");
			String url = context.getInitParameter("dbUrl");
			String user = context.getInitParameter("dbUser");
			String password = context.getInitParameter("dbPassword");
			//System.out.println("Driver: " + driver + "\nUrl: " + url + "\nUser: " + user + "\nPassword: " + password);
			Class.forName(driver);
			connection = DriverManager.getConnection(url , user , password);
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		} catch (SQLException e) {
			e.printStackTrace();
	    }
	}
	
	protected void doGet(HttpServletRequest request , HttpServletResponse response) {

	}
	
	protected void doPost(HttpServletRequest request , HttpServletResponse response) throws ServletException,IOException{
		String userName = request.getParameter("user");
		String password = request.getParameter("password");
		
		String error = "";
		boolean result = false;
		
		//check if the parameters are not empty or null
		if(userName == null || password == null || userName.isEmpty() || password.isEmpty()) {
			error += "Missing parameters;";
			String path = "registration.html";
			ServletContext servletContext = getServletContext();
			final WebContext ctx = new WebContext(request, response, servletContext, request.getLocale());
			ctx.setVariable("errorMsg", error);
			templateEngine.process(path, ctx, response.getWriter());
			//response.sendError(HttpServletResponse.SC_BAD_REQUEST, error);
			return;
		}
		
		//Check if the password contain at least one number and one special character and if it has a size bigger than 4
		if(!(password.contains("0") || password.contains("1") || password.contains("2") || password.contains("3") || password.contains("4") || password.contains("5") || password.contains("6") || password.contains("7") || password.contains("8") || password.contains("9")) 
				|| !(password.contains("#") || password.contains("@") || password.contains("_")) || password.length() < 4)
			error += "Password has to contain at least:4 character,1 number and 1 of the following @,# and _ ;";
		
		//Check if the userName is too long
		if(userName.length() > 45)
			error += "UserName too long;";
		
		//Check if the password is too long
		if(password.length() > 45)
			error += "Password too long;";
		
		if (!error.equals("")) {
			String path = "registration.html";
			ServletContext servletContext = getServletContext();
			final WebContext ctx = new WebContext(request, response, servletContext, request.getLocale());
			ctx.setVariable("errorMsg", error);
			templateEngine.process(path, ctx, response.getWriter());
			//response.sendError(HttpServletResponse.SC_BAD_REQUEST, error);
			return;
		}
		
		UserDAO userDao = new UserDAO(connection);
		
		try {
			result = userDao.addUser(userName, password);
			
			if(result == true) {
				//Redirect to the login page
				String path = getServletContext().getContextPath() +  "/login.html";
				response.sendRedirect(path);
			}
			else {
				String path = "registration.html";
				ServletContext servletContext = getServletContext();
				final WebContext ctx = new WebContext(request, response, servletContext, request.getLocale());
				error += "UserName is not available";
				ctx.setVariable("errorMsg", error);
				templateEngine.process(path, ctx, response.getWriter());
				return;
			}
		}catch(SQLException e) {
			e.printStackTrace();
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Issue with DB");
			return;
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







