<pre>
 ____                                                      
/\  _`\                                                    
\ \ \/\ \        ___         ___         ___         ___   
 \ \ \ \ \      / __`\      /'___\      /'___\      / __`\ 
  \ \ \_\ \    /\ \ \ \    /\ \__/     /\ \__/     /\ \ \ \
   \ \____/    \ \____/    \ \____\    \ \____\    \ \____/
    \/___/      \/___/      \/____/     \/____/     \/___/ 

</pre>

Docco is a quick-and-dirty, hundred-line-long, literate-programming-style
documentation generator. For more information, see:

http://jashkenas.github.com/docco/

This fork of docco is meant to make docco more usable for large projects with a nested directory structure

By using a node server, requests for documentation pages will use docco to generate the documentation for each request,
so you don't have to recompile the docs each time you change a file.
