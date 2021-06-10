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

import it.polimi.tiw.playlist.dao.UserDAO;
import it.polimi.tiw.playlist.utils.ConnectionHandler;

@WebServlet("/Registration")
@MultipartConfig
public class Registration extends HttpServlet{
	private static final long serialVersionUID = 1L;
	private Connection connection;
	
	public Registration() {
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
	
	protected void doGet(HttpServletRequest request , HttpServletResponse response) throws ServletException,IOException{
		doPost(request , response);
	}
	
	protected void doPost(HttpServletRequest request , HttpServletResponse response) throws ServletException,IOException{
		String userName = StringEscapeUtils.escapeJava(request.getParameter("user"));
		String password = StringEscapeUtils.escapeJava(request.getParameter("password"));
		
		String error = "";
		boolean result = false;
		
		//check if the parameters are not empty or null
		if(userName == null || password == null || userName.isEmpty() || password.isEmpty()) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);//Code 400
			response.getWriter().println("Missing parameters;");
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
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);//Code 400
			response.getWriter().println(error);
			return;
		}
		
		UserDAO userDao = new UserDAO(connection);
		
		try {
			result = userDao.addUser(userName, password);
			
			if(result == true) {
				//Send 200
				response.setStatus(HttpServletResponse.SC_OK);//Code 200
			}
			else {
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);//Code 400
				response.getWriter().println("Username not availabe");
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







