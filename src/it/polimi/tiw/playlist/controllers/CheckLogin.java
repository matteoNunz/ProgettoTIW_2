package it.polimi.tiw.playlist.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.UnavailableException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringEscapeUtils;

import it.polimi.tiw.playlist.beans.User;
import it.polimi.tiw.playlist.dao.UserDAO;
import it.polimi.tiw.playlist.utils.ConnectionHandler;

@WebServlet("/CheckLogin")
@MultipartConfig
public class CheckLogin extends HttpServlet{
	private static final long serialVersionUID = 1L;
	private Connection connection;

	public CheckLogin() {
		super();
	}
	
	public void init() {
		ServletContext context = getServletContext();
		
		try {
			connection = ConnectionHandler.getConnection(context);
		} catch (UnavailableException e) {
			e.printStackTrace();
		}
	}
	
	public void doPost(HttpServletRequest request , HttpServletResponse response)throws ServletException,IOException{
		//Take the form fields
		String userName = StringEscapeUtils.escapeJava(request.getParameter("user"));
		String password = StringEscapeUtils.escapeJava(request.getParameter("password"));
		
		//check if the parameters are not empty or null -> if not, send the error and set the status of the response
		if(userName == null || password == null || userName.isEmpty() || password.isEmpty()) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);//Code 400
			response.getWriter().println("Missing parameters;");
			return;
		}
		
		UserDAO userDao = new UserDAO(connection);
		User user = null;
		
		try {
			user = userDao.checkAuthentication(userName, password);
			if(user != null) {
				//Set the session and send the userName back
				request.getSession().setAttribute("user", user);
				//To reduce the session time
				//request.getSession().setMaxInactiveInterval(1);
				response.setStatus(HttpServletResponse.SC_OK);//Code 200
				response.setContentType("application/json");
				response.setCharacterEncoding("UTF-8");
				response.getWriter().println(userName);
			}else {
				response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);//Code 401
				response.getWriter().println("Username e/o password are incorrect;");
			}
		}catch(SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);//Code 500
			response.getWriter().println("Internal server error, retry later");
		}
	}
	
	public void destroy() {
		try {
			ConnectionHandler.closeConnection(connection);
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
}
