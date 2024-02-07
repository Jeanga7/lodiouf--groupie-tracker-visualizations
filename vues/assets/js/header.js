document.addEventListener("DOMContentLoaded", function(){
    window.onscroll = function() {
        if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
            document.querySelector("#header").style.backgroundColor = "white";
            document.querySelector("#header").style.color = "black";
            document.querySelector("#header").style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
            document.querySelector("#logo").innerHTML = '<b style="color:#14213d;">g</b><b style="color:#7e8d85;">t</b><b style="color:#720026;">.</b>';
        } else {
            document.querySelector("#header").style.backgroundColor = "transparent";
            document.querySelector("#header").style.color = "white";
            document.querySelector("#header").style.boxShadow = "none";
            document.querySelector("#logo").innerHTML = '<b>gt.</b>';
        }
    }
    document.querySelector("#logo").addEventListener("click", function(){
        location.href = "/";
    });
});

