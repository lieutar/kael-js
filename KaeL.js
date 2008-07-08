/*

=pod

=head1 NAME

KaeL - tiny javascript application framework.

=head1 SYNOPSIS


=head1 DESCRIPTION


=cut

*/


if( window['KaeL'] === undefined )( function(){

  window.KaeL = { VERSION: 0.01,
                  AUTHOR: "lieutar <lieutar@1dk.jp>" };

  
  KaeL.scriptBaseOf = (function(){
    function KaeL_scriptBaseOf(lib){
      var links = document
    }
    return KaeL_scriptBaseOf;
  });

  KaeL.BASE = KaeL.scriptBaseOf("KaeL.js");

  KaeL.load = (function(){
    function KaeL_load( opt ){
      var url = opt.url;
      var doc = opt.doc || document;
      var script  = doc.createElement('script');
      script.type = 'text/javascript';
      script.href = url.replace(/(\?.*)$/, function(){
      });
    
      (function(){
        if( doc.body ) return doc.body;
        var heads = doc.getElementsByTagName('head');
        if( heads && heads.length > 0 ) return heads[0];
        doc;
      })().appendChild(script);
    }
    return KaeL_load;
  })();


  with( window.KaeL ){
  
    KaeL.Object = (function(){ function KaeL_Object(){ this.initialize(); };
                               return KaeL_Object; })();

    KaeL.Object.prototype.initialize = function(){};



    KaeL.Object.deliver = (function(){
      function deliver (obj, init){
        var klass = function(){};
        klass.prototype = obj;
        return new klass;
    }
    return deliver;
  })();


  KaeL.Object.subclass = function( init ){
    var f = function(){
      if(typeof init == 'function')  return init.apply(this,arguments);
    };
    var p       = function(){};  
    p.prototype = this.prototype;
    f.prototype = new p;
    f.subclass  = KaeL.Object.subclass;
    return f;
  };
  

  var AsyncProc = Object.subclass();
  KaeL.AsyncProc = AsyncProc;

  var AsyncLoop = AsyncProc.subclass(function (){
    var msec         = 10;
    var over         = 30;
    var stack_iter   = [];
    var stack_pc     = [];
    var reg_iterlen  = null;
    var reg_iter     = null;
    var reg_pc       = null;
    var depth        = -1;
    var continuation = null;
    var args         = [];
    var context      = this;

    var push = function(iter){
      depth++;
      stack_iter[depth] = reg_iter;
      stack_pc[depth]   = reg_pc;
      reg_iter = iter;
      reg_pc   = 0;
      reg_iterlen  = iter.length;
    };

    var pop = function(){
      if(depth == 0){
        reg_pc = 0;
        return false;
      }else{
        reg_iter    = stack_iter[depth];
        reg_pc      = stack_pc[depth];
        if(reg_iter) reg_iterlen = reg_iter.length;
        depth--;
        return true;
      }
    }

    var iter = null;
    var loop = function(count, ar){
      if(ar !== undefined) args = ar;
      for(;count > 0;count--){
        var proc = reg_iter[reg_pc];
        reg_pc = (1 + reg_pc) % reg_iterlen;
        
        if(typeof proc == 'function'){
          var a = args;
          args = [];
          var retval = proc.apply(context, a);
          if(retval instanceof AsyncProc){
            retval.run(function(){ loop(count - 1, arguments); });
            return;
          }

          if(retval !== false) continue;
          if(pop()) continue;
          if(!(typeof continuation == 'function')) return;
          a = args;
          args = [];
          continuation.apply(context, a);
          return;
        }

        if(proc instanceof Array){
          push(proc);
          continue;
        }

        if(proc instanceof AsyncProc){
          proc.run(function(){ loop(count - 1, arguments); });
          return ;
        }
      }
      setTimeout(iter, msec);
    };

    iter = function(){ loop(over); }

    push((function(){
      var mc   = false;
      var iter = [];
      var i    = 0;
      var ip   = 0;
      var alen = arguments.length;

      if(typeof arguments[i] == 'number'){
        var a = arguments[i++];
        if(a >= 0) over = a;
        if(typeof arguments[i] == 'number'){
          var a = arguments[i++];
          if(a >= 0) msec = a;
        };
      };
      while(i < alen) iter[ip++] = arguments[i++];
      return iter;
    }).apply(null, arguments));

    this.run  = function(cont){ continuation = cont; iter() };
    this.push = function(){
      var l = arguments.length;
      var p = args.length;
      for(var i = 0; i < l; i++) args[p + i] = arguments[i];
    };
  });

})();

