// This file is part of the GridBee Web Computing Framework
// <http://webcomputing.iit.bme.hu>
// Copyright 2011 Budapest University of Technology and Economics,
// Public Administration's Centre of Information Technology (BME IK)
//
// GridBee is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// GridBee is distributed in the hope that it will be useful
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with GridBee. If not, see <http://www.gnu.org/licenses/>.

package gridbee.worksource.boinc.webrpc;
import gridbee.worksource.boinc.webrpc.result.AccountCreateRes;
import gridbee.worksource.boinc.webrpc.result.AccountInfoRes;
import gridbee.worksource.boinc.webrpc.result.ApplicVersionRes;
import gridbee.worksource.boinc.webrpc.result.CreateTeamRes;
import gridbee.worksource.boinc.webrpc.result.CreditInfoRes;
import gridbee.worksource.boinc.webrpc.result.LookupAccRes;
import gridbee.worksource.boinc.webrpc.result.LookupTeamsRes;
import gridbee.worksource.boinc.webrpc.result.PendingCreditRes;
import gridbee.worksource.boinc.webrpc.result.ProjectConfigRes;
import gridbee.worksource.boinc.webrpc.result.ServerStatusRes;
import gridbee.worksource.boinc.webrpc.result.SetAccountInfoRes;
import gridbee.worksource.boinc.webrpc.result.SetHostInfoRes;
import gridbee.worksource.boinc.webrpc.result.TeamMembrListRes;
import henkolib.async.AsyncOperation;
import gridbee.core.net.HTTPRequest;
import Xml;
import haxe.Md5;
import haxe.xml.Fast;
import Std; 


/**
 * @author GPeter
 * 
 * http://boinc.berkeley.edu/trac/wiki/WebRpc
 * 
 * BoincWebRPC Class:
	 * constructor: Instantiation with project Url
	 * ***USER RELATED:
	 * lookupAccount: the user's authentication string is returned
	 * getAccountInfo: returns data associated with the given account
	 * setAccountInfo: ****TODO Nem tudtam tesztelni mert nem találja a php fájlt!****
	 * createAccount: returns authentication string if successful
	 * getCreditInformationWithID: lists credit information
	 * getCreditInformationWithAuth: lists associated hosts too
	 * getPendingCreditInfo
	 * setHostInfo
	 * ***TEAMS:
	 * createTeam
	 * lookupTeamByName: Teams with names matching *string* will be returned. A maximum of 100 teams will be returned.
	 * lookupTeamByID
	 * getTeamMembersList: Show list of team members. If authentication string is that of a team administrator, show email addresses, and flag indicating whether the user opted out of getting emails
	 * ***PROJECT RELATED:
	 * getServerStatus: some servers doesn't allow this action without logging in
	 * getApplicationVersionsList 
	 * projectConfiguration
 * 
 * ***Not implemented:
 * setForumPreferences(){}
 * getUserLastPost(){}
 * 
 * You need to enter the Auth string manually in the functions, you can get it with lookupAccount().
 * 
 * Note: If you change e-mail with the setAccountInfo function, you have to tpye in the password so it can update the hash!
 */

class BoincWebRPC 
{
	public var projectUrl : String;

	public function new(projectUrl : String) 
	{	
		while (StringTools.endsWith(projectUrl, '/'))
		{
			projectUrl = projectUrl.substr(0,projectUrl.length-1); // shorten string to remove '/' from last place, do as many times as necessary
		}
		this.projectUrl = projectUrl;
	}
	
//************************************************User Related***************************************************
	
	public function lookupAccount(email : String, passwd : String) 
	{
		var operation : AsyncOperation<LookupAccRes> = new AsyncOperation<LookupAccRes>();
		var passwd_hash : String; 
		var url : String; 
		
		email = email.toLowerCase();
		
		passwd_hash = Md5.encode(passwd + email);
		url = projectUrl + '/lookup_account.php?email_addr=' + email + '&passwd_hash=' + passwd_hash + '&get_opaque_auth=0';
		var req = HTTPRequest.get(url).send();
		
		req.onComplete.subscribe(function(response: HTTPResponse)
		{
			var inXml = Xml.parse(response.content);
			var input : Fast = new Fast(inXml.firstElement());
			if (input.name == 'error')
			{
				if (input.hasNode.error_msg) 
				{
					operation.setError(input.node.error_msg.innerData);
					// trace(operation.getError());
				}
				else if (input.hasNode.error_string)
				{
					operation.setError(input.node.error_string.innerData);
					// trace(operation.getError());
				}
			}
			else
			{
				var output : LookupAccRes = new LookupAccRes(input);
				operation.setResult(output);
				// output.print();
			}
		});
		
		req.onError.subscribe(function(error)
		{
			operation.setError(error);
		});
		
		return operation;
	}
	
	public function getAccountInfo(Auth : String) 
	{
		var operation : AsyncOperation<AccountInfoRes> = new AsyncOperation<AccountInfoRes>();
		var url : String; 
		
		url = projectUrl + '/am_get_info.php?account_key='+Auth;
		var req = HTTPRequest.get(url).send();
		
		req.onComplete.subscribe(function(response: HTTPResponse)
		{
			var inXml = Xml.parse(response.content);
			var input : Fast = new Fast(inXml.firstElement());
			if (input.name == 'error')
			{
				if (input.hasNode.error_msg)
				{
					operation.setError(input.node.error_msg.innerData);
					// trace(operation.getError());
				}
				else if (input.hasNode.error_string)
				{
					operation.setError(input.node.error_string.innerData);
					// trace(operation.getError());
				}
			}
			else
			{
				var output : AccountInfoRes = new AccountInfoRes(input);
				operation.setResult(output);
				// output.print();
			}
		});
		
		req.onError.subscribe(function(error)
		{
			operation.setError(error);
		});
		
		return operation;
	}
	
	public function setAccountInfo(Auth : String, ?email_addr : String = '', ?password : String = '', ?name : String = '', ?country : String = '', ?postal_code : String = '', ?global_prefs : String = '', ?project_prefs : String = '', ?yoururl : String = '', ?send_email : Int = -1, ?show_hosts : Int = -1, ?teamid : Int = -1, ?venue : String = '')
	{
		var operation : AsyncOperation<SetAccountInfoRes> = new AsyncOperation<SetAccountInfoRes>();
		var url : String; 
		
		url = projectUrl + '/am_set_info.php?account_key='+Auth;
		
		if (email_addr != '')
			url += '&email_addr=' + email_addr.toLowerCase();
		if (password != '')
			url += '&password_hash=' + Md5.encode(password + email_addr.toLowerCase());
		if (name != '')
			url += '&name=' + StringTools.urlEncode(name);
		if ( country != '')
			url += '&country=' + StringTools.urlEncode(country);
		if (postal_code != '')
			url += '&postal_code=' + StringTools.urlEncode(postal_code);
		if (global_prefs != '')
			url += '&global_prefs=' + StringTools.urlEncode(global_prefs);
		if (project_prefs != '')
			url += '&project_prefs=' + StringTools.urlEncode(project_prefs);
		if (yoururl != '')
			url += '&url=' + yoururl;
		if (send_email != -1) 
		{
			if (send_email == 1)
				url += '&send_email=1';
			else if (send_email == 0 )
				url += '&send_email=0';
		}
		if (show_hosts != -1) 
		{
			if (show_hosts == 1)
				url += '&show_hosts=1';
			else if (show_hosts == 0)
				url += '&show_hosts=0';
		}
		if (teamid != -1)
			url += '&teamid=' + teamid;
		if (venue != '')
			url += '&venue=' + StringTools.urlEncode(venue);
		
		//trace(url);
		
		var req = HTTPRequest.get(url).send();
		
		req.onComplete.subscribe(function(response: HTTPResponse)
		{
			var inXml = Xml.parse(response.content);
			var input : Fast = new Fast(inXml.firstElement());
			if (input.name == 'error')
			{
				if (input.hasNode.error_msg)
				{
					operation.setError(input.node.error_msg.innerData);
					// trace(operation.getError());
				}
				else if (input.hasNode.error_string)
				{
					operation.setError(input.node.error_string.innerData);
					// trace(operation.getError());
				}
			}
			else
			{
				var output : SetAccountInfoRes = new SetAccountInfoRes(input);
				operation.setResult(output);
				// output.print();
			}  
		});
		
		req.onError.subscribe(function(error)
		{
			operation.setError(error);
		});
		
		return operation;
	}
	
	public function createAccount(username : String,email : String,passwd : String) 
	{
		var operation : AsyncOperation<AccountCreateRes> = new AsyncOperation<AccountCreateRes>();
		var url : String; 
		var passwd_hash : String;
		
		email = email.toLowerCase();
		passwd_hash = Md5.encode(passwd + email);
		
		url = projectUrl + '/create_account.php?email_addr='+email+'&passwd_hash='+passwd_hash+'&user_name='+username;
		var req = HTTPRequest.get(url).send();
		
		req.onComplete.subscribe(function(response: HTTPResponse)
		{
			var inXml = Xml.parse(response.content);
			var input : Fast = new Fast(inXml.firstElement());
			if (input.name == 'error')
			{
				if (input.hasNode.error_msg)
				{
					operation.setError(input.node.error_msg.innerData);
					// trace(operation.getError());
				}
				else if (input.hasNode.error_string)
				{
					operation.setError(input.node.error_string.innerData);
					// trace(operation.getError());
				}
			}
			else
			{
				var output : AccountCreateRes = new AccountCreateRes(input);
				operation.setResult(output);
				// output.print();
			}
		});
		
		req.onError.subscribe(function(error)
		{
			operation.setError(error);
		});
		
		return operation;
	}
	
	public function getCreditInformationWithID(Id : Int) // Info about the account
	{
		var operation : AsyncOperation<CreditInfoRes> = new AsyncOperation<CreditInfoRes>();
		var url : String; 
		
		url = projectUrl + '/show_user.php?userid='+Id+'&format=xml';
		var req = HTTPRequest.get(url).send();
		
		req.onComplete.subscribe(function(response: HTTPResponse)
		{
			var inXml = Xml.parse(response.content);
			var input : Fast = new Fast(inXml.firstElement());
			if (input.name == 'error')
			{
				if (input.hasNode.error_msg)
				{
					operation.setError(input.node.error_msg.innerData);
					// trace(operation.getError());
				}
				else if (input.hasNode.error_string)
				{
					operation.setError(input.node.error_string.innerData);
					// trace(operation.getError());
				}
			}
			else
			{
				var output : CreditInfoRes = new CreditInfoRes(input);
				operation.setResult(output);
				// output.print();
			} 
		});
		
		req.onError.subscribe(function(error)
		{
			operation.setError(error);
		});
		
		return operation;
	}
	
	public function getCreditInformationWithAuth(Auth : String) //  returns a list of hosts associated with the account
	{
		var operation : AsyncOperation<CreditInfoRes> = new AsyncOperation<CreditInfoRes>();
		var url : String; 
		
		url = projectUrl + '/show_user.php?auth='+Auth+'&format=xml';
		var req = HTTPRequest.get(url).send();
		
		req.onComplete.subscribe(function(response: HTTPResponse)
		{
			var inXml = Xml.parse(response.content);
			var input : Fast = new Fast(inXml.firstElement());
			if (input.name == 'error')	
			{
				if (input.hasNode.error_msg)
				{
					operation.setError(input.node.error_msg.innerData);
					// trace(operation.getError());
				}
				else if (input.hasNode.error_string)
				{
					operation.setError(input.node.error_string.innerData);
					// trace(operation.getError());
				}
			}
			else
			{
				var output : CreditInfoRes = new CreditInfoRes(input);
				operation.setResult(output);
				// output.print();
				// output.host[0].print();
			}  
		});
		
		req.onError.subscribe(function(error)
		{
			operation.setError(error);
		});
		
		return operation;
	}
	
	public function getPendingCreditInfo(Auth : String) //  returns a list of hosts associated with the account
	{
		var operation : AsyncOperation<PendingCreditRes> = new AsyncOperation<PendingCreditRes>();
		var url : String; 
		
		url = projectUrl + '/pending.php?authenticator='+Auth+'&format=xml';
		var req = HTTPRequest.get(url).send();
		
		req.onComplete.subscribe(function(response: HTTPResponse)
		{
			var inXml = Xml.parse(response.content);
			var input : Fast = new Fast(inXml.firstElement());
			if (input.name == 'error') 
			{
				if (input.hasNode.error_msg)
				{
					operation.setError(input.node.error_msg.innerData);
					// trace(operation.getError());
				}
				else if (input.hasNode.error_string)
				{
					operation.setError(input.node.error_string.innerData);
					// trace(operation.getError());
				}
			}
			else
			{
				var output : PendingCreditRes = new PendingCreditRes(input);
				operation.setResult(output);
				// output.print();
				// if (output.pending_arr != null) output.pending_arr[0].print(); else trace('No pending credits');
			}   
		});
		
		req.onError.subscribe(function(error)
		{
			operation.setError(error);
		});
		
		return operation;
	}
	
	public function setHostInfo(Auth : String, hostid : Int, venue : String)
	{
		var operation : AsyncOperation<SetHostInfoRes> = new AsyncOperation<SetHostInfoRes>();
		var url : String; 
		
		url = projectUrl + '/am_set_host_info.php?account_key='+Auth+'&hostid='+hostid+'&venue='+StringTools.urlEncode(venue);
		var req = HTTPRequest.get(url).send();
		
		req.onComplete.subscribe(function(response: HTTPResponse)
		{
			var inXml = Xml.parse(response.content);
			var input : Fast = new Fast(inXml.firstElement());
			if (input.name == 'error') 
			{
				if (input.hasNode.error_msg)
				{
					operation.setError(input.node.error_msg.innerData);
					// trace(operation.getError());
				}
				else if (input.hasNode.error_string)
				{
					operation.setError(input.node.error_string.innerData);
					// trace(operation.getError());
				}
			}
			else
			{
				var output : SetHostInfoRes = new SetHostInfoRes(input);
				operation.setResult(output);
				// output.print();
			}  
		});
		
		req.onError.subscribe(function(error)
		{
			operation.setError(error);
		});
		
		return operation;
	}
	
	//*************************************Teams*******************************************
	
	public function createTeam(Auth : String, TeamName : String, TeamType : String, ?TeamDescription : String = '', ?TeamCountry : String = '', ?TeamUrl : String, ?TeamNameHTML : String = '')
	{
		var operation : AsyncOperation<CreateTeamRes> = new AsyncOperation<CreateTeamRes>();
		var url : String;
		
		if (TeamNameHTML == '')
		TeamNameHTML = TeamName; // if it doesn't get any HTML formatted team name, then it uses the original inputted team name
		
		url = projectUrl + '/create_team.php?account_key=' + Auth + '&name=' + StringTools.urlEncode(TeamName) + '&type=' + StringTools.urlEncode(TeamType) + '&name_html=' + StringTools.htmlEscape(TeamNameHTML);
		
		if (TeamDescription != '')
		url += '&description=' + StringTools.urlEncode(TeamDescription); 
		if (TeamCountry != '') 
		url += '&country=' + StringTools.urlEncode(TeamCountry); 
		if (TeamUrl != '') 
		url += '&url=' + TeamUrl; 
		
		var req = HTTPRequest.get(url).send();
		
		req.onComplete.subscribe(function(response: HTTPResponse)
		{
			var inXml = Xml.parse(response.content);
			var input : Fast = new Fast(inXml.firstElement());
			if (input.name == 'error')
			{
				if (input.hasNode.error_msg)
				{
					operation.setError(input.node.error_msg.innerData);
					// trace(operation.getError());
				}
				else if (input.hasNode.error_string)
				{
					operation.setError(input.node.error_string.innerData);
					// trace(operation.getError());
				}
			}
			else
			{
				var output : CreateTeamRes = new CreateTeamRes(input);
				operation.setResult(output);
				// output.print();
			}  
		});
		
		req.onError.subscribe(function(error)
		{
			operation.setError(error);
		});
		
		return operation;
	}
	
	public function lookupTeamByName(TeamName : String) //  returns a list of hosts associated with the account
	{
		var operation : AsyncOperation<LookupTeamsRes> = new AsyncOperation<LookupTeamsRes>();
		var url : String; 
		
		url = projectUrl + '/team_lookup.php?team_name=' + StringTools.urlEncode(TeamName) + '&format=xml';
		var req = HTTPRequest.get(url).send();
		
		req.onComplete.subscribe(function(response: HTTPResponse)
		{
			var inXml = Xml.parse(response.content);
			var input : Fast = new Fast(inXml.firstElement());
			if (input.name == 'error') 
			{
				if (input.hasNode.error_msg)
				{
					operation.setError(input.node.error_msg.innerData);
					// trace(operation.getError());
				}
				else if (input.hasNode.error_string)
				{
					operation.setError(input.node.error_string.innerData);
					// trace(operation.getError());
				}
			}
			else
			{
				var output : LookupTeamsRes = new LookupTeamsRes(input);
				operation.setResult(output);
				// output.print(); 
			}  
		});
		
		req.onError.subscribe(function(error)
		{
			operation.setError(error);
		});
		return operation;
	}
	
	public function lookupTeamByID(TeamID : Int) //  returns a list of hosts associated with the account
	{
		var operation : AsyncOperation<LookupTeamsRes> = new AsyncOperation<LookupTeamsRes>();
		var url : String; 
		
		url = projectUrl + '/team_lookup.php?team_id=' + TeamID + '&format=xml';
		var req = HTTPRequest.get(url).send();
		
		req.onComplete.subscribe(function(response: HTTPResponse)
		{
			var inXml = Xml.parse(response.content);
			var input : Fast = new Fast(inXml.firstElement());
			if (input.name == 'error')
			{
				if (input.hasNode.error_msg)
				{
					operation.setError(input.node.error_msg.innerData);
					// trace(operation.getError());
				}
				else if (input.hasNode.error_string)
				{
					operation.setError(input.node.error_string.innerData);
					// trace(operation.getError());
				}
			}
			else
			{
				var output : LookupTeamsRes = new LookupTeamsRes(input);
				operation.setResult(output);
				// output.print();
			}  
		});
		
		req.onError.subscribe(function(error)
		{
			operation.setError(error);
		});
		
		return operation;
	}
	
	public function getTeamMembersList(TeamID : Int, ?TeamAdminAuth : String = '') //  returns a list of hosts associated with the account
	{
		var operation : AsyncOperation<TeamMembrListRes> = new AsyncOperation<TeamMembrListRes>();
		var url : String; 
		
		url = projectUrl + '/team_email_list.php?teamid=' + TeamID + '&xml=1';
		if (TeamAdminAuth != '')
		url += '&account_key=' + TeamAdminAuth;
		
		var req = HTTPRequest.get(url).send();
		
		req.onComplete.subscribe(function(response: HTTPResponse)
		{
			var inXml = Xml.parse(response.content);
			var input : Fast = new Fast(inXml.firstElement());
			if (input.name == 'error') 
			{
				if (input.hasNode.error_msg)
				{
					operation.setError(input.node.error_msg.innerData);
					// trace(operation.getError());
				}
				else if (input.hasNode.error_string)
				{
					operation.setError(input.node.error_string.innerData);
					// trace(operation.getError());
				}
			}
			else{
				var output : TeamMembrListRes = new TeamMembrListRes(input);
				operation.setResult(output);
				// output.print();
			    }   
		});
		
		req.onError.subscribe(function(error)
		{
			operation.setError(error);
		});
		
		return operation;
	}
	
	//*********************************Project Related**************************************************
	
	public function getServerStatus()
	{ // some servers doesn't allow this action without logging in
		var operation : AsyncOperation<ServerStatusRes> = new AsyncOperation<ServerStatusRes>();
		var url : String; 
		
		url = projectUrl + '/server_status.php?xml=1';
		var req = HTTPRequest.get(url).send();
		
		req.onComplete.subscribe(function(response: HTTPResponse)
		{
			if (response.content.indexOf('Access denied') != -1)
			{ 
				operation.setError('Access denied, you might have to log in for this action');
				// trace(operation.getError());					  
			}
			else
			{ 
				var inXml = Xml.parse(response.content);
				var input : Fast = new Fast(inXml.firstElement());
				if (input.name == 'error') 
				{
					if (input.hasNode.error_msg)
					{
						operation.setError(input.node.error_msg.innerData);
						// trace(operation.getError());
					}
					else if (input.hasNode.error_string){
						operation.setError(input.node.error_string.innerData);
						// trace(operation.getError());
														}
				} 
				else
				{
					var output : ServerStatusRes = new ServerStatusRes(input);
					operation.setResult(output);
					// output.print();
				}    
			} 
		});	
		
		req.onError.subscribe(function(error)
		{
			operation.setError(error);
		});
		
		return operation;
	}
	
	public function getApplicationVersionsList() 
	{
		var operation : AsyncOperation<ApplicVersionRes> = new AsyncOperation<ApplicVersionRes>();
		var url : String; 
		
		url = projectUrl + '/apps.php?xml=1';
		var req = HTTPRequest.get(url).send();
		
		req.onComplete.subscribe(function(response: HTTPResponse)
		{
			var inXml = Xml.parse(response.content);
			var input : Fast = new Fast(inXml.firstElement());
			if (input.name == 'error')
			{
				if (input.hasNode.error_msg)
				{
					operation.setError(input.node.error_msg.innerData);
					// trace(operation.getError());
				}
				else if (input.hasNode.error_string)
				{
					operation.setError(input.node.error_string.innerData);
					// trace(operation.getError());
				}
			}
			else
			{
				var output : ApplicVersionRes = new ApplicVersionRes(input);
				operation.setResult(output);
				// output.print();
			}  
		});
		
		req.onError.subscribe(function(error)
		{
			operation.setError(error);
		});
		
		return operation;
	}
	
	public function projectConfiguration()
	{
		var operation : AsyncOperation<ProjectConfigRes> = new AsyncOperation<ProjectConfigRes>();
		var url : String; 
		
		url = projectUrl + '/get_project_config.php';
		var req = HTTPRequest.get(url).send();
		
		req.onComplete.subscribe(function(response: HTTPResponse)
		{
			var inXml = Xml.parse(response.content);
			var input : Fast = new Fast(inXml.firstElement());
			if (input.name == 'error') 
			{
				if (input.hasNode.error_msg)
				{
					operation.setError(input.node.error_msg.innerData);
					// trace(operation.getError());
				}
				else if (input.hasNode.error_string)
				{
					operation.setError(input.node.error_string.innerData);
					// trace(operation.getError());
				}
			}
			else
			{
				var output : ProjectConfigRes = new ProjectConfigRes(input);
				operation.setResult(output);
				// output.print();
			}  
		});
		
		req.onError.subscribe(function(error)
		{
			operation.setError(error);
		});
		
		return operation;
	}
	
}
