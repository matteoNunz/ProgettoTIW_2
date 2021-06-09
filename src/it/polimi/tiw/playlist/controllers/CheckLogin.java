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

import it.polimi.tiw.playlist.beans.User;
import it.polimi.tiw.playlist.dao.UserDAO;

@WebServlet("/CheckLogin")
public class CheckLogin extends HttpServlet{
	private static final long serialVersionUID = 1L;
	private Connection connection;
	private TemplateEngine templateEngine;

	public CheckLogin() {
		super();
	}
	
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
	
	
	public void doPost(HttpServletRequest request , HttpServletResponse response)throws ServletException,IOException{
		//String userName = StringEscapeUtils.escapeJava(request.getParameter("user"));
		//String password = StringEscapeUtils.escapeJava(request.getParameter("password"));
		String userName = request.getParameter("user");
		String password = request.getParameter("password");
		String error = "";
		
		//check if the parameters are not empty or null
		if(userName == null || password == null || userName.isEmpty() || password.isEmpty())
			error += "Missing parameters;";
		
		if(!error.equals("")) {
			String path = "/login.html";
			ServletContext servletContext = getServletContext();
			final WebContext ctx = new WebContext(request, response, servletContext, request.getLocale());
			ctx.setVariable("errorMsg", error);
			templateEngine.process(path, ctx, response.getWriter());
			return;
		}
		
		UserDAO userDao = new UserDAO(connection);
		User user;
		
		try {
			user = (User) userDao.checkAuthentication(userName, password);
			if(user != null) {
				//go to home page
				request.getSession().setAttribute("user", user);
				String path = getServletContext().getContextPath() + "/GoToHomePage";
				response.sendRedirect(path);
			}else {
				error += "Username e/o password are incorrect;";
				String path = "login.html";
				ServletContext servletContext = getServletContext();
				final WebContext ctx = new WebContext(request, response, servletContext, request.getLocale());
				ctx.setVariable("errorMsg", error);
				templateEngine.process(path, ctx, response.getWriter());
				return;
			}
			
		}catch(SQLException e) {
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, error);
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
