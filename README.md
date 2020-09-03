Disposable Docker Containers servered over the same port. (Works with VNC and services too, such as webservers, databases, etc) Think 10 minute mail for docker containers, once you logout the container is gone!

Principles used:

Reverse Proxy, Docker Sock, and NodeJS


Recomended Implementation:

Nginx Proxy using a config such as:

```


stream {
    upstream loadbalancer_adventure_01 {
        server sshswitchboard-adventure-01:22;
    }


    upstream loadbalancer_adventure_02 {
        server sshswitchboard-adventure-02:22;
    }


    upstream loadbalancer_adventure_03 {
        server sshswitchboard-adventure-03:5901;
    }




    server {
        listen       22;
        allow  192.168.0.x/32;
        deny   all;
        proxy_pass  loadbalancer_adventure_01;
    }

    server {
        listen       23;
        allow  192.168.0.x/32;
        deny   all;
        proxy_pass   loadbalancer_adventure_02;
    }


    server {
        listen       24;
        allow  192.168.0.x/32;
        deny   all;
        proxy_pass   loadbalancer_adventure_03;
    }



}



```




There is a WordPress plugin which allows for registration whitelist/blacklist of IP addresses to limit DDOS attacks.

The reccomended usage of this application is to allow similar functionality to http://OverTheWire.org, you can deploy your own docker images via the server. 

For example: 

You have a class of 20 students, and in order to allow each student to run through various linux exercises you would either need to give each student their own server, or you can use this. 

Simply run the server and have any new student connect to the server over the same port, the Node Server will spin up a new docker container for each student so they can perform their tasks. 

After the student is finished, simply have them logout like normal and the container would be cleaned up on a schedule. No risk of any student gettingt the same containers as they are spwaned and orphaned until cleaned up (this allows instructor auditing, etc)
