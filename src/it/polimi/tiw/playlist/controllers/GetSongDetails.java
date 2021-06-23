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
import javax.servlet.http.HttpSession;

import org.apache.commons.lang.StringEscapeUtils;
import org.json.JSONException;
import org.json.JSONObject;

import it.polimi.tiw.playlist.beans.SongDetails;
import it.polimi.tiw.playlist.beans.User;
import it.polimi.tiw.playlist.dao.PlaylistDAO;
import it.polimi.tiw.playlist.dao.SongDAO;
import it.polimi.tiw.playlist.utils.ConnectionHandler;
import it.polimi.tiw.playlist.utils.GetEncoding;

@WebServlet("/GetSongDetails")
@MultipartConfig
public class GetSongDetails extends HttpServlet{

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
		//Take the song id
		String songId = StringEscapeUtils.escapeJava(request.getParameter("songId"));
		String playlistId = StringEscapeUtils.escapeJava(request.getParameter("playlistId"));
		String error = "";
		int sId = -1;
		int pId = -1;
		
		HttpSession s = request.getSession();
		//Take the user
	    User user = (User) s.getAttribute("user");
		
		//Check if songId is valid
		if(songId.isEmpty() || songId == null)
			error += "Song not defined;";
		//Check if playlistId is valid
		if(playlistId.isBlank() || playlistId == null)
			error += "Playlist not defined;";
		
		//Check the follow only if the id is valid
		if(error.equals("")) { 
			try {
				//Create DAO to check if the song id and the playList id belong to the user
				SongDAO sDao = new SongDAO(connection);
				PlaylistDAO pDao = new PlaylistDAO(connection);
				
				//Check if the songId and the playlistId are numbers
				sId = Integer.parseInt(songId);
				pId = Integer.parseInt(playlistId);
				
				//Check if the player has this song --> Check if the song exists
				if(!sDao.findSongByUser(sId, user.getId())) {
					error += "Song doesn't exist";
				}
				//Check if the player has this playList
				if(!pDao.findPlayListById(pId, user.getId())) {
					error += "Playlist doesn't exist;";
				}
			}catch(NumberFormatException e) {
				error += "Request with bad format;";
			}catch(SQLException e) {
				error += "Impossible comunicate with the data base;";
			}
		}
		
		//if an error occurred
		if(!error.equals("")){
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);//Code 400
			response.getWriter().println(error);
			return;
		}
		
		//User can be here 
		
		//To take song details 
		SongDAO sDao = new SongDAO(connection);//I can use the same sDao used before
		
		try {
			SongDetails song = sDao.getSongDetails(sId);
			
			JSONObject jSonObject = new JSONObject();
			
			jSonObject.put("songTitle" , song.getSongTitle());
			jSonObject.put("singer" , song.getSinger());
			jSonObject.put("albumTitle" , song.getAlbumTitle());
			jSonObject.put("publicationYear" , song.getPublicationYear());
			jSonObject.put("genre" , song.getKindOf());
			
			try {
				jSonObject.put("base64String" , GetEncoding.getSongEncoding(song.getSongFile(), 
						getServletContext(), connection, user));
				
			}catch(IOException e) {
				jSonObject.put("base64String" , "");
			}
			
			response.setStatus(HttpServletResponse.SC_OK);//Code 200
			response.setContentType("application/json");
			response.setCharacterEncoding("UTF-8");
			response.getWriter().println(jSonObject);
			
		}catch(SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);//Code 500
			response.getWriter().println("An arror occurred with the db, retry later");
			return;
		}catch(JSONException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);//Code 500
			response.getWriter().println("Internal server error, error during the creation of the response");
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
