package it.polimi.tiw.playlist.controllers;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.UnavailableException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import it.polimi.tiw.playlist.beans.User;
import it.polimi.tiw.playlist.dao.PlaylistDAO;
import it.polimi.tiw.playlist.dao.SongDAO;
import it.polimi.tiw.playlist.utils.ConnectionHandler;

@WebServlet("/AddSong")
public class AddSong extends HttpServlet{
	
	private static final long serialVersionUID = 1L;
	private Connection connection;
	
	public void init(){
		try {
			connection = ConnectionHandler.getConnection(getServletContext());
		} catch (UnavailableException e) {
			//TODO send an error
			e.printStackTrace();
		}
	}
	
	public void doPost(HttpServletRequest request , HttpServletResponse response)throws ServletException,IOException{
		String playlistId = request.getParameter("playlistId");
		String songId = request.getParameter("song");
		String error = "";
		int pId = -1;
		int sId = -1;
		
		HttpSession s = request.getSession();
		//Take the user
	    User user = (User) s.getAttribute("user");
		
	    //Check id the parameters are present
		if(playlistId == null || playlistId.isEmpty() || songId == null || songId.isEmpty()) {
			error += "Missing parameter;";
		}
		
		if(error.equals("")) {
			try {
				//Create the DAO to check if the playList id belongs to the user 
				PlaylistDAO pDao = new PlaylistDAO(connection);
				SongDAO sDao = new SongDAO(connection);
				
				//Check if the playlistId and songId are numbers
				pId = Integer.parseInt(playlistId);
				sId = Integer.parseInt(songId);
				
				//Check if the user can access in this playList --> Check if the playList exists
				if(!pDao.findPlayListById(pId, user.getId()))
					error += "PlayList doesn't exist";
				//Check if the player has created the song with sId as id -->Check if the song exists
				if(!sDao.findSongByUser(sId, user.getId()))
					error += "Song doesn't exist;";
				//Check if the song is already in the playList
				if(pDao.findSongInPlaylist(pId, sId))
					error += "Song already present in this playList;";
			}catch(NumberFormatException e) {
				error += "Playlist not defined;";
			}catch(SQLException e) {
				error += "Impossible comunicate with the data base;";
			}
		}
		
		//if an error occurred
		if(!error.equals("")) {
			request.setAttribute("error", error);
			String path = getServletContext().getContextPath() + "/GoToPlayListPage?playlistId=" + playlistId + "&section=0";

			RequestDispatcher dispatcher = getServletContext().getRequestDispatcher(path);
			dispatcher.forward(request,response);
		}
		
		//The user can add the song at the playList
		
		//To add the song in the playList
		PlaylistDAO pDao = new PlaylistDAO(connection);
		
		try {
			boolean result = pDao.addSong(pId, sId);
			
			if(result == true) {
				String path = getServletContext().getContextPath() + ("/GoToPlayListPage?playlistId=" + playlistId + "&section=0");
				response.sendRedirect(path);
			}
			else {
				error += "An arror occurred with the db, retry later;";
				request.setAttribute("error", error);
				//Forward to GoToPlaylistPage
				String path = getServletContext().getContextPath() + "/GoToPlayListPage?playlistId=" + playlistId + "&section=0";
				RequestDispatcher dispatcher = getServletContext().getRequestDispatcher(path);
				dispatcher.forward(request,response);
			}
		}catch(SQLException e) {
			e.printStackTrace();
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "An arror occurred with the db, retry later");
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
