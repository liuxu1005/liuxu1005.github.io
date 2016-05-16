import java.applet.Applet;
import java.util.*;
import java.awt.event.MouseListener; 
import java.awt.event.MouseEvent;
import java.awt.event.ActionListener;
import java.awt.event.ActionEvent;
import java.awt.*;
import java.lang.Math;
import java.text.DecimalFormat;


public class Triangulation extends Applet implements MouseListener, 
    ActionListener {

/*************Data Structures**************************************/
    //data structures for vertices, edgeS of polygon
    private ArrayList<Point> vertices;
    private ArrayList<Vertex> event;
 
     
    
    //components on the applet
    private Button reset; 
    private Button startover;
    private Button checkmon; 
    private Button mkmon;  
    private Button triangulate;  
    private Panel mypanel; 
	private TextArea msg;
	private Checkbox slow;
	
	
	//variables recording mediate results
	//data for processing progress
    private boolean inputdone;  
    private boolean monotonic;
    private boolean checkmondone;
    private boolean tried;
    private boolean makemon; 
    
    //data for checking monotonicity
    private Interval covered;
    private double position;
    private LinkedList<Interval> coveredonce;
    private LinkedList<Interval> mirror;
    private ArrayList<IntervalPair> workdirection;
    
/*********************Basic Methods***********************************/
    public void init() {
        //initialize data structures
        vertices = new ArrayList<Point>();
        event = new ArrayList<Vertex>();
        covered = new Interval(0, 0, 0);
        workdirection = new ArrayList<IntervalPair>();
        position = 0;
        coveredonce = new LinkedList<Interval>();
        mirror = new LinkedList<Interval>();
        //initialize status
        inputdone = false;
        checkmondone = false;
        makemon = false;
        monotonic = false;
        tried = false;
        
        slow = new Checkbox("Slow");
        reset = new Button("Reset");
        startover = new Button("Start Over");
    	checkmon = new Button("Check Monotonicity");
      	mkmon = new Button("Make Monotonic Piece");
       	triangulate = new Button("Triangulate");        	
       	mypanel = new Panel();
		msg = new TextArea("Please input points:\r\n", 7, 20, TextArea.SCROLLBARS_VERTICAL_ONLY);
        //add components        
       	addMouseListener(this);
        setLayout(new BorderLayout());      
       	add(mypanel, "South");
		add(msg, "East");
		
		reset.addActionListener(this);
		startover.addActionListener(this);
		checkmon.addActionListener(this);
		mkmon.addActionListener(this);
		triangulate.addActionListener(this);
		mypanel.add(slow);
      	mypanel.add(reset);
      	mypanel.add(startover);
       	mypanel.add(checkmon);
       	mypanel.add(mkmon);
       	mypanel.add(triangulate); 
    }
        
    //methods for input polygon  
    public void mouseClicked(MouseEvent e) {
		Graphics g = getGraphics();
		if(tried == true) {
		    msg.append("\r\nProcess has been done. Press reset button"
                        +" for new input.\r\n");   
            return;
		}
		if(makemon == true) {
		    msg.append("\r\nGot monotonicity. Press "
                        +" Triangulate to triangulate.\r\n");   
            return;
		}
		if(checkmondone == true) {
		    if (monotonic == true)
                msg.append("\r\nThe polygon is monotonic. Press Triangulate to triangulate.\r\n");
            else
                msg.append("\r\nThe polygon is not monotonic. Press Make Monotonic Pieces "
                                        + " to make it into monotonic pieces.\r\n");
            return;
		}
		if (inputdone == true) {
            msg.append("\r\nInput has been done. Press reset button"
                        +" for new input, or press other buttons"
                                               +" for process.\r\n");
			return;
 		}
		
        if(e.getButton() == MouseEvent.BUTTON1) {
        	
        	Point apoint = new Point(e.getX(), e.getY());
			Point lastp;
			int nvertices = vertices.size();
           	if (nvertices >= 1) { 
           		lastp = vertices.get(vertices.size() - 1);
               	if (lastp.x == apoint.x && lastp.y == apoint.y) {
               		msg.append("\r\nPoint exsits, keep previous one.\r\n");
                   	return;
	   			}       
            }
            if (checkvalid(apoint) != true) {
                msg.append("\r\nInvalid point, discarded.\r\n");
                return;
            }  	 
           	vertices.add(apoint);
       		g.drawOval(apoint.x,apoint.y,3,3);
          	g.fillOval(apoint.x,apoint.y,3,3);
                 
            if (nvertices >=1) {
                lastp = vertices.get(nvertices-1);
                g.drawLine(lastp.x, lastp.y, apoint.x, apoint.y);
            }
            return;
		}	
                       
        if (e.getButton() == MouseEvent.BUTTON3) {
            
            if (vertices.isEmpty()) {
                msg.append("\r\nLeft-click to creat point.\r\n");
                return;
            }
            
            if (vertices.size() < 3) {
                msg.append("\r\nNeed more point.\r\n");
                return;
            }
            
            Point firstp = vertices.get(0);
            if (checkvalid(firstp) != true) {
                msg.append("\r\nInvalid point, need another point.\r\n");
                return;
            } 
			
			Point lastp = vertices.get(vertices.size() - 1);
            g.drawLine(firstp.x, firstp.y, lastp.x, lastp.y); 
			inputdone = true;
			adjustInputOrder();
        }
                    
    }
    
    //methods responding to buttons
    public void actionPerformed(ActionEvent e) {
        
        if(e.getSource() == reset) {
            msg.setText("Please input points:\r\n");
            reset();
            vertices.clear();
            inputdone = false;
            return;      
        }
        
        if(e.getSource() == checkmon && inputdone == true) {
            
            if(checkmondone == false) {
                monotonic = checkMon(); 
                checkmondone = true;
            }
            if (monotonic == true)
                msg.append("\r\nThe polygon is monotonic. Start from green vertex to Red vertex.\r\n");
            else
                msg.append("\r\nThe polygon is not monotonic.\r\n");
            return;
        } 
        
        if(e.getSource() == mkmon && inputdone == true && makemon == false ) {
           
            if (checkmondone == false) {
                monotonic = checkMon();
                checkmondone = true;
            }
          
            if (monotonic == false) {
                msg.append("\r\nMake horizontal monotonic sub polygon.\r\n");
                mkMon();
            } else {
                msg.append("\r\nThe polygon is monotonic.\r\n");
            }
            makemon = true;
            return;
        }
        if(e.getSource() == triangulate && inputdone == true && tried == false) {
            
            if (checkmondone == false) {
                monotonic = checkMon();
                checkmondone = true;
            }
             
            if (monotonic == true) {
                msg.append("\r\nThe polygon is monotonic.\r\n");
                triMon();
            } else {
                if (makemon ==false) {
                    mkMon();
                    makemon = true;
                }
                msg.append("\r\nRed diagonals are for monotonic piece, yellow ones are for triangulation\r\n");
                triMons();
            }
            tried = true;
            return;  
        } 
        if(e.getSource() == startover && inputdone == true) {
            reset();
            drawPolygon();    
        }      
    }
    
    //start over
    private void reset() {
	    
	    makemon = false;
	    monotonic = false;
	    checkmondone = false;
	    tried = false;
	    
	    
	    covered.low = 0;
	    covered.high = 0;
	    covered.vertex = 0;
        position = 0;
        
        workdirection.clear();
        coveredonce.clear();
        mirror.clear();
        event.clear();
        
	    Graphics g = getGraphics();
	    Dimension d = getSize();
	    g.clearRect(0, 0, d.width, d.height);   
	}
	private void drawPolygon() {
	    int nvertices = vertices.size();
        Graphics g = getGraphics();
        Point cur, next;
		for (int i = 0; i < nvertices; i++) {
		    cur = vertices.get(i);
		    next = vertices.get((i+1)%nvertices);
		    g.drawLine(cur.x, cur.y, next.x, next.y);   
		}
    }		
	
    //methods for processing polygon
    
    //make sure input is kept in ccw order 
    private void adjustInputOrder() {
        double sum = 0;
        int nvertices = vertices.size();
        Graphics g = getGraphics();
		for (int i = 0; i < nvertices; i++) {
		    
		    double angle = 
		    Angle.angle(vertices.get(i), vertices.get((i + 1) % nvertices), 
		                            vertices.get((i + 2) % nvertices));
            sum = sum + angle;		
		}		 
		if (sum > 0) 
		    Collections.reverse(vertices);
    } 
    
    //check if new input intersects previous inputs
    private boolean checkvalid(Point a) {
		int size = vertices.size();
		if (size >= 3) {
		    Point last = vertices.get(size - 1);
		    for (int i = 0; i < size - 1; i++) {
		        Point p1 = vertices.get(i);
		        Point p2 = vertices.get(i + 1);
		        if(checkinter(p1, p2, last, a))
		            return false;
		    }
		}
		 
		return true;
    }
	private boolean checkinter(Point p1, Point p2, Point p3, Point p4) {
	
	    double a3 = Angle.angle(p1, p2, p3);
	    double a4 = Angle.angle(p1, p2, p4);
	    double a1 = Angle.angle(p3, p4, p1);
	    double a2 = Angle.angle(p3, p4, p2);
	    
	    if (Math.abs(Angle.angle(p1, p2, p3) + 180) < 0.000001 
	        && Math.abs(Angle.angle(p2, p1, p3) + 180) < 0.000001) 
	        return true;
	    if (Math.abs(Angle.angle(p1, p2, p4) + 180) < 0.000001 
	        && Math.abs(Angle.angle(p2, p1, p4) + 180) < 0.000001)
	        return true;
	    if (Math.abs(Angle.angle(p3, p4, p1) + 180) < 0.000001 
	        && Math.abs(Angle.angle(p4, p3, p1) + 180) < 0.000001) 
	        return true;  
	    if (Math.abs(Angle.angle(p3, p4, p2) + 180) < 0.000001 
	        && Math.abs(Angle.angle(p4, p3, p2) + 180) < 0.000001) 
	        return true;    
        
	    if ((a3 * a4 < 0) && (a1 * a2 < 0)) 
	         return true;
	         
	    return false;
	}
	
	
/*************check monotonicity of polygon*******************************/
    private boolean checkMon() {
        if (checkMon_helper()) {
            Graphics g = getGraphics();
            int n = vertices.size();
            for (int i = 0; i < n; i++) 
                g.drawString(" "+ (i+1)+" ", vertices.get(i).x, vertices.get(i).y);
            showMon();
            return true;
        } else {
            return false;
        }
    }
    
	private boolean checkMon_helper() {
	    
	    int nvertices = vertices.size();
		double tmpangle;
		
		//find the interval covered exactly once
        for (int i = 0; i < nvertices; i++) {
            tmpangle = Angle.angle(vertices.get(i), 
                       vertices.get((i + 1) % nvertices),
                       vertices.get((i + 2) % nvertices));
            double newposition = tmpangle + position;
            //case 1): current position is positive
            if (position >= 0) {
                //case a): rotate cw
                if (newposition >= position) {
                    //case i): not beyond covered area upper bound
                    if (newposition <= covered.high) {
                        //do nothing
                    //case ii): beyond covered area upper bound but not beyond lower bound
                    } else if (newposition <= covered.low + 360) {
                        
                        Interval tmp = new Interval(covered.high, newposition, (i + 1) % nvertices);
                        coveredonce.addFirst(tmp);    
                        covered.high = newposition;
                    //case iii): beyond covered area lower bound but not finished a circle
                    } else if (newposition < 360) { 
                        if (covered.high < covered.low + 360) {
                            Interval tmp = new Interval(covered.high, covered.low + 360, (i + 1) % nvertices);
                            coveredonce.addFirst(tmp);
                        }    
                        covered.high = newposition;
                        
                    //case iv): finished a circle, but twice covered area not beyond 180 degree 
                    } else if (newposition < covered.low + 540) {
                    
                        Interval tmp;
                        
                        if (covered.high < covered.low + 360) {
                            tmp = new Interval(covered.high, covered.low + 360, (i + 1) % nvertices);
                            coveredonce.addFirst(tmp);
                        }  
                        
                        double transformedposition = newposition - 360;
                        tmp = coveredonce.peekLast();
                        while (tmp != null && transformedposition > tmp.high) {
                            coveredonce.removeLast();
                            tmp = coveredonce.peekLast();
                        }
                        if (tmp != null && transformedposition > tmp.low) {
                            tmp.low = transformedposition;
                        } 
                        covered.high = newposition;
                    //case v): definitely no working area
                    } else {
                        coveredonce.clear();
                        return false;
                    }
                //case b): rotate ccw
                } else {
                    //case i): still in positive area
                    if (newposition >= 0) {
                    
                        Interval tmp = coveredonce.peekFirst();
                        while (tmp != null  && tmp.low > newposition) {
                            coveredonce.removeFirst();
                            tmp = coveredonce.peekFirst();
                        }
                        if (tmp != null && tmp.high > newposition) {
                            tmp.high = newposition;
                        } 
                    //case ii): switch to negative area, but still in covered area
                    } else if (newposition >= covered.low) {
                        coveredonce.clear();
                    //case iii): beyond covered area lower bound, not beyond upper area
                    } else if (newposition >= covered.high - 360) {
                        coveredonce.clear();
                        Interval tmp = new Interval(newposition, covered.low, (i + 1) % nvertices);
                        coveredonce.addLast(tmp);
                        covered.low = newposition;
                    
                    } else { 
                        coveredonce.clear(); 
                        if (covered.low > covered.high - 360) {
                            Interval tmp = new Interval(covered.high - 360, covered.low, (i + 1) % nvertices);
                            coveredonce.addLast(tmp);
                        }
                        covered.low = newposition;
                    }
                
                }
            //case 2): current in negative position
            } else {
                //case a): rotate ccw
                if (newposition <= position) {
                    //case i): not beyond covered lower bound
                    if (newposition >= covered.low) {
                        //do nothing
                    //case ii): beyond covered lower bound but not beyond covered high bound
                    } else if (newposition >= covered.high - 360) {
                        
                        Interval tmp = new Interval(newposition, covered.low, (i + 1) % nvertices);
                        coveredonce.addLast(tmp);    
                        covered.low = newposition; 
                    //case iii): not finished a circle      
                    } else if (newposition >= -360) {
                        if (covered.low > covered.high - 360) {
                            Interval tmp = new Interval(covered.high - 360, covered.low, (i + 1) % nvertices);
                            coveredonce.addLast(tmp);
                        }    
                        covered.low = newposition;
                    //case iv): finished a circle but not twice covered more than 180 degree
                    } else if (newposition >= covered.high -540) {
                        Interval tmp;
                        
                        if (covered.low > covered.high - 360) {
                            tmp = new Interval(covered.high - 360, covered.low,  (i + 1) % nvertices);
                            coveredonce.addLast(tmp);
                        }
                        
                        double transformedposition = newposition + 360;
                        tmp = coveredonce.peekFirst();
                        while (tmp != null && tmp.low >= transformedposition) {
                            coveredonce.removeFirst();
                            tmp = coveredonce.peekFirst();
                        }
                        if (tmp != null && tmp.high > transformedposition) {
                            tmp.high = transformedposition;
                        } 
                        covered.low = newposition;
                    } else {
                        coveredonce.clear();
                        return false;
                    }
                    
                //case b): rotate cw
                } else {
                    //case i): still in negative area
                    if (newposition <= 0) {
                        Interval tmp = coveredonce.peekLast();
                        while (tmp != null  && (newposition >= tmp.high)) {
                            coveredonce.removeLast();
                            tmp = coveredonce.peekLast();
                        }
                        if (tmp != null && newposition > tmp.low) {
                            tmp.low = newposition;
                        } 
                    //case ii): switch to positive area but not beyond covered area
                    } else if (newposition <= covered.high) {
                    
                        coveredonce.clear();
                    //case iii): go beyond covered upper bound but not beyond lower bound 
                    } else if (newposition < covered.low + 360) {
                        coveredonce.clear();
                        Interval tmp = new Interval(covered.high, newposition, (i + 1) % nvertices);
                        coveredonce.addFirst(tmp);
                        covered.high = newposition;
                       
                    } else { 
                        coveredonce.clear();
                        if (covered.low + 360 > covered.high) {
                            Interval tmp = new Interval(covered.high, covered.low + 360, (i + 1) % nvertices);
                            coveredonce.addFirst(tmp);
                        }
                        covered.high = newposition;
                    
                    }
                
                }
            
            }
            position = newposition;
        }
        
        
        if (coveredonce.isEmpty()) { 
            return false;
        } else {
            return findDirection();
        }
    }  
     
    //find monotonic direction 
    private boolean findDirection() { 
        Graphics g = getGraphics(); 
        int n = coveredonce.size();
        
		Interval tmp = coveredonce.pollLast();
		Interval tmp1;
		if (tmp.low >= -180) 
		    return false;
		while (tmp != null) {
		    if (tmp.high < -180) {
		        tmp.low = tmp.low + 180;
		        tmp.high = tmp.high + 180;
		        mirror.addFirst(tmp);
		        tmp = coveredonce.pollLast(); 
		         
		    } else if (tmp.low < -180 ) {
		        tmp1 = new Interval(tmp.low + 180, 0, tmp.vertex);
		        tmp.low = -180;
		        mirror.addFirst(tmp1);
		        coveredonce.addLast(tmp);
		        break;
		    } else {
		        coveredonce.addLast(tmp);
		        break;
		    }
		}
		 
            
        tmp = coveredonce.pollLast();
	    tmp1 = mirror.pollLast();   
		while ( tmp != null && tmp1 != null) {
		    
		    if (tmp.high <= tmp1.low) {
		        tmp = coveredonce.pollLast();
		    } else if (tmp1.high <= tmp.low ) {
		        tmp1 = mirror.pollLast();
		    } else {
		        
		        if (ComparePosition.cp(vertices.get(tmp.vertex), vertices.get(tmp1.vertex))
		                                                    == Position.LEFT) {
		            workdirection.add(new IntervalPair(tmp, tmp1));
                         
		        } else {
		            workdirection.add(new IntervalPair(tmp1, tmp));           
		        }
		        if (tmp.high > tmp1.high) {
		            tmp1 = mirror.pollLast();
		        } else if (tmp.high < tmp1.high) {
		            tmp = coveredonce.pollLast();
		        } else {
		            tmp1 = mirror.pollLast();
		            tmp = coveredonce.pollLast();
		        }
		    }	
		}
		 
		if (workdirection.isEmpty())
		    return false;
		else
	        return true;
	}
	private void showMon() {
	    int n = workdirection.size();
	    IntervalPair tmp;
	    double tmpl, tmph, horizontal;
	    Point zero = new Point(vertices.get(0).x/2, vertices.get(0).y);
	    DecimalFormat df = new DecimalFormat("#.##");
	    
	    horizontal = Angle.angle(zero, vertices.get(0), vertices.get(1));   
	    msg.append("\r\nMonotonic direction:\r\n");  
	    for (int i = 0; i < n; i++) {
	        tmp = workdirection.get(i);
	        tmpl = horizontal + (tmp.start.low > tmp.end.low ? tmp.start.low : tmp.end.low);
	        tmph = horizontal + (tmp.start.high < tmp.end.high ? tmp.start.high : tmp.end.high);
	        msg.append("["+df.format(tmpl)+", " + df.format(tmph) + "]" + " " 
	        + (tmp.start.vertex +1) + " -> " + (tmp.end.vertex + 1) + "\r\n");           
	    }
	
	}
 
/******************make non monotonic polygon into monotonic peices**********/
    private void mkMon() {
        msg.append("\r\nYellow point is currently being processed, "
                   +"Green Point is helper point, " + 
                   "Red line is relative to currently processed point.\r\n");
        
        TreeMap<Vertex, Vertex> status = new TreeMap<Vertex, Vertex>(new compareVertex());
		//creat sorted auxilary vertices array
		int nvertices = vertices.size();
		Vertex from = null;
		Vertex tmp = null;
		
        for (int i = 0; i < nvertices; i++) {     
			tmp = new Vertex(vertices.get(i), from, null); 
			if (from != null) {
			    from.to = tmp;
			}
			event.add(tmp);    
			from = tmp;     
		}
		tmp.to = event.get(0);
		event.get(0).from = tmp;
 
		Collections.sort(event, new Comparator<Vertex>() {
			public int compare(Vertex v1, Vertex v2) {
		
				Position rlt = ComparePosition.cp(v1.position, v2.position);			 
				return ComparePosition.cp(v1.position, v2.position) 
						                      == Position.LEFT ? -1 : 1;
			}
		});
		
		int eventsize = event.size();
		for (int i = 0; i < eventsize; i++) {
		    
		    tmp = event.get(i); 
		    switch (style(tmp)) {
		        case START:
		            handleStart(tmp, status);
		            break;
		        case END:
		            handleEnd(tmp,  status);
		            break;
		        case MERGE:
		            handleMerge(tmp,  status);
		            break;
		        case SPLIT:
		            handleSplit(tmp,  status);
		            break;
		        case REGULAR:
		            handleRegular(tmp,  status);
		            break;
		        
		    }  
		}
		
	}
	
    //helper function for adjudge vertex types
    private VertexStyle style(Vertex v) {
        if (ComparePosition.cp(v.from.position, v.position) == Position.RIGHT
            && ComparePosition.cp(v.to.position, v.position) == Position.RIGHT) {
            
            if (Angle.angle(v.from.position, v.position, v.to.position) > 0) {
                   
                return VertexStyle.SPLIT;
            } else {
                   
                return VertexStyle.START;
            }  
        } else if (ComparePosition.cp(v.from.position, v.position) == Position.LEFT
                    && ComparePosition.cp(v.to.position, v.position) == Position.LEFT) {
                
            if (Angle.angle(v.from.position, v.position, v.to.position) < 0) {
                  
                return VertexStyle.END;
            } else {
                  
                return VertexStyle.MERGE;
            }
        } else {
                  
            return VertexStyle.REGULAR;
        }
    
    
    }
    
    //methods for making monotonic pieces per style of vertex
    
    private void handleStart(Vertex v , TreeMap<Vertex, Vertex> status) { 
       
        Graphics g = getGraphics();
        g.setColor(Color.YELLOW);
        g.drawOval(v.position.x, v.position.y, 3, 3);
        g.fillOval(v.position.x, v.position.y, 3, 3); 
        pause();
        	                  
        v.style = VertexStyle.START;
        v.helper = v;
        
        g.setColor(Color.GREEN);
        g.drawOval(v.helper.position.x, v.helper.position.y, 3, 3);
        g.fillOval(v.helper.position.x, v.helper.position.y, 3, 3);
         
        g.setColor(Color.RED);
        g.drawLine(v.position.x, v.position.y, v.to.position.x, v.to.position.y);
     
		status.put(v, v);
		pause();
		
    }
    private void handleEnd(Vertex v , TreeMap<Vertex, Vertex> status) {
        
        Graphics g = getGraphics();
        g.setColor(Color.YELLOW);
        g.drawOval(v.position.x, v.position.y, 3, 3);
        g.fillOval(v.position.x, v.position.y, 3, 3); 
        pause();
        
        v.style = VertexStyle.END;
        Vertex tmp = v.from.helper;
         
        if (style(tmp) == VertexStyle.MERGE) 
            addDiagonal(v, tmp);
            
        g.setColor(Color.BLACK);
        g.drawLine(v.from.position.x, v.from.position.y, v.position.x, v.position.y);
        g.drawOval(v.from.helper.position.x, v.from.helper.position.y, 3, 3);
        g.fillOval(v.from.helper.position.x, v.from.helper.position.y, 3, 3);
        g.drawOval(v.position.x, v.position.y, 3, 3);
        g.fillOval(v.position.x, v.position.y, 3, 3);  
        
        status.remove(v.from);
        pause();
    }
    
    private void handleMerge(Vertex v , TreeMap<Vertex, Vertex> status){
        
        
        Graphics g = getGraphics();
        g.setColor(Color.YELLOW);
        g.drawOval(v.position.x, v.position.y, 3, 3);
        g.fillOval(v.position.x, v.position.y, 3, 3); 
        pause();
        
        v.style = VertexStyle.MERGE;
        Vertex tmp = v.from.helper;
        if (style(tmp) == VertexStyle.MERGE) 
            addDiagonal(v, tmp);
        
        g.setColor(Color.BLACK);
        g.drawLine(v.from.position.x, v.from.position.y, v.position.x, v.position.y);
        g.drawOval(v.from.helper.position.x, v.from.helper.position.y, 3, 3);
        g.fillOval(v.from.helper.position.x, v.from.helper.position.y, 3, 3); 
          
        status.remove(v.from);
        
        tmp = status.lowerKey(v);
        if (style(tmp.helper) == VertexStyle.MERGE) 
            addDiagonal(v, tmp.helper);
        
        g.setColor(Color.BLACK);
        g.drawOval(tmp.helper.position.x, tmp.helper.position.y, 3, 3);
        g.fillOval(tmp.helper.position.x, tmp.helper.position.y, 3, 3); 
        
        tmp.helper = v;
        
        g.setColor(Color.GREEN);
        g.drawOval(v.position.x, v.position.y, 3, 3);
        g.fillOval(v.position.x, v.position.y, 3, 3); 
        pause();
    }
    
    private void handleSplit(Vertex v , TreeMap<Vertex, Vertex> status) {
        
        Graphics g = getGraphics();
        g.setColor(Color.YELLOW);
        g.drawOval(v.position.x, v.position.y, 3, 3);
        g.fillOval(v.position.x, v.position.y, 3, 3); 
        pause();
        
        v.style = VertexStyle.SPLIT;
        Vertex tmp = status.lowerKey(v);
        addDiagonal(v, tmp.helper);
        
        g.setColor(Color.BLACK);
        g.drawOval(tmp.helper.position.x, tmp.helper.position.y, 3, 3);
        g.fillOval(tmp.helper.position.x, tmp.helper.position.y, 3, 3); 
        
        tmp.helper = v; 
        
        g.setColor(Color.GREEN);
        g.drawOval(v.position.x, v.position.y, 3, 3);
        g.fillOval(v.position.x, v.position.y, 3, 3); 
           
        v.helper = v;
        
        g.setColor(Color.RED);
        g.drawLine(v.position.x, v.position.y, v.to.position.x, v.to.position.y);
        
        status.put(v, v.helper);
        pause();
    }
    
    private void handleRegular(Vertex v , TreeMap<Vertex, Vertex> status){
        
        
        Graphics g = getGraphics();
        g.setColor(Color.YELLOW);
        g.drawOval(v.position.x, v.position.y, 3, 3);
        g.fillOval(v.position.x, v.position.y, 3, 3); 
        pause();
        
        if (ComparePosition.cp(v.position, v.to.position) == Position.LEFT) {
            v.style = VertexStyle.BELOW;
            Vertex tmp = v.from.helper;
            
            if (style(tmp) == VertexStyle.MERGE) 
                addDiagonal(v, tmp);
                
            g.setColor(Color.BLACK);
            g.drawOval(v.from.helper.position.x, v.from.helper.position.y, 3, 3);
            g.fillOval(v.from.helper.position.x, v.from.helper.position.y, 3, 3);
            g.drawLine(v.from.position.x, v.from.position.y, v.position.x, v.position.y);
            
            status.remove(v.from);
            v.helper = v;
            g.setColor(Color.GREEN);
            g.drawOval(v.helper.position.x, v.helper.position.y, 3, 3);
            g.fillOval(v.helper.position.x, v.helper.position.y, 3, 3);
            
            g.setColor(Color.RED);
            g.drawLine(v.position.x, v.position.y, v.to.position.x, v.to.position.y);
            
            status.put(v, v);
            
        
        } else { 
            v.style = VertexStyle.ABOVE;
            Vertex tmp = status.lowerKey(v);
            if (style(tmp.helper) == VertexStyle.MERGE) 
                addDiagonal(v, tmp.helper);
            
            g.setColor(Color.BLACK);
            g.drawOval(tmp.helper.position.x, tmp.helper.position.y, 3, 3);
            g.fillOval(tmp.helper.position.x, tmp.helper.position.y, 3, 3);
            
            tmp.helper = v;
            g.setColor(Color.GREEN);
            g.drawOval(tmp.helper.position.x, tmp.helper.position.y, 3, 3);
            g.fillOval(tmp.helper.position.x, tmp.helper.position.y, 3, 3);    
                   
        }
        pause();
    }
    
    private void addDiagonal(Vertex v1, Vertex v2) {
    
        if (v1.image == false) {
            v1.image = true;
            v1.ito = new LinkedList<Vertex>();
        }
        v1.ito.add(v2);
        if (v2.image == false) {
            v2.image = true;
            v2.ito = new LinkedList<Vertex>();
        }
        v2.ito.add(v1);
        Graphics g = getGraphics();
        g.drawLine(v1.position.x, v1.position.y, v2.position.x, v2.position.y);
        pause();
    
    }
    
/***********************triangulate polygon****************************/
    private void triMons() {
    
        if (monotonic == true) {
            triMon();
            return;
        }
          
        int eventsize = event.size();
        Vertex v;
        for (int i = 0; i < eventsize; i++) {
            v = event.get(i); 
		    switch (v.style) {
		        case START:
		            triStart(v);
		            break;
		        case SPLIT:
		            triSplit(v);
		            break;
		        case ABOVE:
		            triAbove(v);
		            break;    
		
		    }  
        }
	
	}
	
	//triangulate monotonic input
	private void triMon() {
	    LinkedList<Vertex> polygon = new LinkedList<Vertex>(); 
	    LinkedList<Point> l = new LinkedList<Point>();
	    LinkedList<Point> u = new LinkedList<Point>();
	    int start = workdirection.get(0).start.vertex;
	    int end = workdirection.get(0).end.vertex;
	    Graphics g = getGraphics();
	    
	    Point tmpp = vertices.get(start);
	    g.setColor(Color.GREEN);
        g.drawOval(tmpp.x, tmpp.y, 3, 3);
        g.fillOval(tmpp.x, tmpp.y, 3, 3);
        g.setColor(Color.RED);
        tmpp = vertices.get(end);
        g.drawOval(tmpp.x, tmpp.y, 3, 3);
        g.fillOval(tmpp.x, tmpp.y, 3, 3);
          	                	            
	    for (int i = start; i % vertices.size() != end; i++) {
	        l.add(vertices.get(i % vertices.size()));  
	    }
	    for (int i = end; i % vertices.size() != start; i++) {
	        u.addFirst(vertices.get(i % vertices.size()));   
	    }
	    
	    Vertex tmp;
	    Point upper, lower, zero;
	    Interval e, s;
	    s = workdirection.get(0).start;
	    e = workdirection.get(0).end;
	    double tmpl =  s.low > e.low ? s.low : e.low;
	    double tmph =  s.high < e.high ? s.high : e.high;
	    double workangle = 90 + (tmpl + tmph)/2 + 
	                       Angle.angle(new Point(vertices.get(0).x/2, vertices.get(0).y), 
	                                                   vertices.get(0), vertices.get(1));
	                        
	    double roughdir = Angle.angle(new Point(vertices.get(s.vertex).x/2, vertices.get(s.vertex).y), 
	                        vertices.get(s.vertex), vertices.get(e.vertex));
	                        
	    double sign = (Math.cos(Math.toRadians(workangle)) * Math.cos(Math.toRadians(roughdir))
	                  + Math.sin(Math.toRadians(workangle)) * Math.sin(Math.toRadians(roughdir))) < 0 ? -1 : 1;
	    
	    double dirX = Math.cos(Math.toRadians(workangle));
	    double dirY = Math.sin(Math.toRadians(workangle));
	    
	    while(!l.isEmpty() && !u.isEmpty()) {
	        upper = u.peekLast();
	        lower = l.peekLast();
	        double uprojection = sign * (upper.y * dirY + upper.x * dirX);
	        double lprojection = sign * (lower.y * dirY + lower.x * dirX);
	        
	        if (uprojection >= lprojection ) {
	            tmp = new Vertex(u.pollLast(), null, null);
	            tmp.upper = true;
	            polygon.addFirst(tmp);
	        
	        } else {
	            tmp = new Vertex(l.pollLast(), null, null);
	            tmp.upper = false;
	            polygon.addFirst(tmp);
	        
	        }
	    }
	    if (u.isEmpty()) {
	        while(!l.isEmpty()) {
	            tmp = new Vertex(l.pollLast(), null, null);
	            tmp.upper = false;
	            polygon.addFirst(tmp);
	        }
	    }
	    
	    if (l.isEmpty()) {
	        while(!u.isEmpty()) {
	            tmp = new Vertex(u.pollLast(), null, null);
	            tmp.upper = true;
	            polygon.addFirst(tmp);
	        }
	    }  
	    triPiece(polygon);
	}
    //triangulating non monotonic input per vertex type 
	private void triStart(Vertex v) {
	   
	    LinkedList<Vertex> poly = new LinkedList<Vertex>(); 
	    Pair tmp = nextV(v.from, v);
	    
	    while (tmp.i != -1) {  
	        v.ito.remove(tmp.i);   
	        extractSubpoly(v, tmp.v, poly);    
	        triPiece(poly); 
	        tmp = nextV(v.from, v);
	         
	    }
	    extractSubpoly(v, tmp.v, poly);
	    triPiece(poly); 
	      
	}
	
    private void triSplit(Vertex v) {
	
	    LinkedList<Vertex> poly = new LinkedList<Vertex>();
	    LinkedList<Vertex> processed = new LinkedList<Vertex>();
	    if (v.image == true) {
	        int size = v.ito.size();
	        
	        for(int i = 0; i < size; i++) {
	            
	            Vertex tmp = v.ito.get(i);
	            if (tmp.style == VertexStyle.BELOW) {
	                extractSubpoly(tmp, tmp.to, poly);
	                triPiece(poly);
	            } else if (tmp.style == VertexStyle.ABOVE) {
	            
	                extractSubpoly(tmp, v, poly);
	                triPiece(poly);
	            } else if (tmp.style == VertexStyle.SPLIT) {
	                if(new compareVertex().compare(v, tmp) == -1) {
	                    if (ComparePosition.cp(v.position, tmp.position) == Position.LEFT) 
	                        extractSubpoly(v, v.to, poly);
	                    else
	                        extractSubpoly(tmp, v, poly);
	                    
	                } else {
	                    if (ComparePosition.cp(v.position, tmp.position) == Position.LEFT) 
	                        extractSubpoly(v, tmp, poly);
	                    else
	                        extractSubpoly(tmp, tmp.to, poly);
	                }
	                
	                triPiece(poly);
	            }   
	            processed.add(tmp); 
	        }
	        while (!processed.isEmpty()) {
	            v.ito.remove(processed.poll());
	        }    
	    }
	}
	
	private void triAbove(Vertex v) {
	    LinkedList<Vertex> poly = new LinkedList<Vertex>();
	    LinkedList<Vertex> processed = new LinkedList<Vertex>();
	    if (v.image == true) {
            int size = v.ito.size();
	        for(int i = 0; i < size; i++){
	            Vertex tmp = v.ito.get(i);
	            if (tmp.style == VertexStyle.SPLIT) {
	                extractSubpoly(v, tmp, poly);
	                processed.add(tmp);
	                triPiece(poly);
	            }    
	            
	        }
	        while (!processed.isEmpty()) {
	            v.ito.remove(processed.poll());
	        }
	    
	    }
	}
	
    //helper function for identifying subpolygons
	private void extractSubpoly(Vertex v1, Vertex v2, LinkedList<Vertex> poly) {
	    LinkedList<Vertex> lower = new LinkedList<Vertex>();
	    LinkedList<Vertex> upper = new LinkedList<Vertex>();
	    Graphics g = getGraphics();
	    
	    
	    Vertex pre = v1;
	    Vertex cur = v2;
	    Pair t = nextV(pre, cur);
	    Vertex next = t.v;
	    pre.upper = false;
	    lower.add(pre);
	    
	    g.setColor(Color.RED);
	    g.drawLine(pre.position.x, pre.position.y, cur.position.x, cur.position.y);
	    while(next != v1) {
	        pause();
	        g.drawLine(cur.position.x, cur.position.y, next.position.x, next.position.y);
	        if(t.i != -1)
	            cur.ito.remove(t.i);
	        if (ComparePosition.cp(cur.position, next.position) == Position.LEFT) {
	            cur.upper = false;
	            lower.add(cur);
	        } else {
	            cur.upper = true;
	            upper.addFirst(cur);
	        }
	        pre = cur;
	        cur = next;
	        t = nextV(pre, cur);
	        next = t.v;
	         
	    }
	    g.drawLine(cur.position.x, cur.position.y, next.position.x, next.position.y);
	    cur.upper = true;
	    upper.addFirst(cur);
	    merge(lower, upper, poly);
	    pause();
	}
	private void merge(LinkedList<Vertex> l, LinkedList<Vertex> u,
	                                            LinkedList<Vertex> poly) {
	    while(!l.isEmpty() && !u.isEmpty()) {
	        if (ComparePosition.cp(l.peekLast().position, u.peekLast().position) 
	                                                            == Position.LEFT) {
	            
	            poly.addFirst(u.pollLast());
	        
	        } else {
	            poly.addFirst(l.pollLast());
	        
	        }
	    }
	    while(!l.isEmpty()) {
	        poly.addFirst(l.pollLast());
	    }	  	
	}
	private Pair nextV(Vertex v1, Vertex v2) {
	    if (v2.image == false)
	        return new Pair(v2.to, -1);
	    if (v2.ito.isEmpty())
	        return new Pair(v2.to, -1);
	    
	    double angle = Angle.angle(v1.position, v2.position, v2.to.position);;
	    int minIndex = -1;
	    int eventsize = v2.ito.size();
	    for (int i = 0; i < eventsize; i++) {
	        Vertex t = v2.ito.get(i);
	        if (t == v1)
	            continue;
	        double tmpangle = Angle.angle(v1.position, v2.position, t.position);
	        if (angle > tmpangle) {
	            angle = tmpangle;
	            minIndex = i;
	        }
	     }
	     if (minIndex == -1) 
	        return new Pair(v2.to, -1);
	     return new Pair(v2.ito.get(minIndex), minIndex);
	    
	}
 
    //triangulate subpolygon pieces
    private void triPiece(LinkedList<Vertex> polygon) {
        LinkedList<Vertex> processing = new LinkedList<Vertex>();
        Graphics g = getGraphics();
        g.setColor(Color.YELLOW);
        processing.addFirst(polygon.poll());
        processing.addFirst(polygon.poll());
        Vertex tmp, top, next;
    
        while (polygon.size() > 1) {
            
            next = polygon.poll();
            top = processing.peekFirst();
            if (next.upper != top.upper) {       
                while (processing.size() > 1) {
                    tmp = processing.poll();
                    g.drawLine(tmp.position.x, tmp.position.y, next.position.x, next.position.y);
                }
                processing.poll();
                processing.addFirst(top);
                processing.addFirst(next);
                pause();
            
            } else {
                
                tmp = processing.poll();
                
                while(!processing.isEmpty() &&
                      (((next.upper == false) && 
                      (Angle.angle(next.position, tmp.position, processing.peekFirst().position) > 0 )) ||
                      ((next.upper == true) && 
                     (Angle.angle(next.position, tmp.position, processing.peekFirst().position) < 0 )))) {
                    tmp = processing.poll();
                    g.drawLine(tmp.position.x, tmp.position.y, next.position.x, next.position.y);     
                    pause();
                }
                processing.addFirst(tmp);
                processing.addFirst(next);  
            }
            
        }
         
        processing.poll();
        next = polygon.poll();
        while (processing.size() > 1) {
            tmp = processing.poll();
            g.drawLine(tmp.position.x, tmp.position.y, next.position.x, next.position.y);
            pause();
        }
        processing.poll(); 
    }
    private void pause() {
        int elapse = 0;
        if (slow.getState()) 
            elapse = 500;   
        long cur = System.currentTimeMillis();
        while (cur + elapse > System.currentTimeMillis()) {
                        //pause
        }
    }

    //overide abstract methods which we don't need
    public void mouseExited(MouseEvent e) {}
    public void mouseEntered(MouseEvent e) {}
    public void mousePressed(MouseEvent e) {}
    public void mouseReleased(MouseEvent e) {}
       	 
}
 
/************************auxiliary classes*********************************/

//Point class
class Point {
    public final int x;
    public final int y;
    public Point(int x, int y) {
        this.x = x;
        this.y = y;
    }
}


class Vertex {
    public Point position;
    public Vertex from;
	public Vertex to;
	public Vertex helper;
	public boolean upper;
	public VertexStyle style;
	
	//data for diagonals
	public boolean image;
	public LinkedList<Vertex> ito;	
	
	public Vertex(Point p1, Vertex f, Vertex t) {
		position = p1;
		from = f;
        to = t;
        image = false;
        
	}
}

enum VertexStyle { START, END, MERGE, SPLIT, REGULAR, BELOW, ABOVE}

//for calculating angle of edges
class Angle {

    public static double angle(Point p0, Point p1, Point p2) {
		//calculate angle by inner product
        double tmp1 = Math.acos(((p2.x - p1.x) * (p1.x - p0.x) + 
		              (p2.y - p1.y) * (p1.y - p0.y))/
		              (Math.sqrt(((p2.x - p1.x) * (p2.x - p1.x) + 
		              (p2.y - p1.y) * (p2.y - p1.y))) * Math.sqrt(
		              ((p1.x - p0.x) * (p1.x - p0.x) + 
		              (p1.y - p0.y) * (p1.y - p0.y)))));
		//calculate angle by cross product
        double tmp2 = Math.asin(((p1.x - p0.x) * (p2.y - p1.y) - 
		              (p2.x - p1.x) * (p1.y - p0.y))/
		              (Math.sqrt(((p2.x - p1.x) * (p2.x - p1.x) + 
		              (p2.y - p1.y) * (p2.y - p1.y))) * Math.sqrt(
		              ((p1.x - p0.x) * (p1.x - p0.x) + 
		              (p1.y - p0.y) * (p1.y - p0.y)))));
	
        int sign = tmp2 < 0 ? -1 : 1;   
		return Math.toDegrees(tmp1) * sign;
		    
    }

}
//for comparing vertex relative position
class compareVertex implements Comparator<Vertex> {
    public int compare(Vertex v1, Vertex v2) {
         
	    if (v1 == v2)
	        return 0;
	    double tmp = auxiliaryY(v2.position, v2.to.position, v1.position.x);
	        
	    if (v1.position.y >= tmp)     
	        return -1;
	    else 
	        return 1; 
    }
    
    private double auxiliaryY(Point p1, Point p2, double x) {
        return (p1.y * (p2.x - x) + p2.y * ( x - p1.x))/(p2.x - p1.x);
    }	     
}

//for comparing point relative position
enum Position { LEFT, RIGHT}

class ComparePosition {
	static public Position cp(Point p1, Point p2) {
		if (p1.x < p2.x) {
		    return Position.LEFT;
		} else if (p1.x > p2.x) {
			return Position.RIGHT;
        } else if (p1.y > p2.y) {
			return Position.RIGHT;
		}else {return Position.LEFT;}		

	}
}

//interval for recording covered zone
class Interval {
    public double low;
    public double high;
    public int vertex;
    Interval(double l, double h, int v) {
        low = l;
        high = h;
        vertex = v;
    }
} 

class IntervalPair {
    public Interval start;
    public Interval end;
    
    IntervalPair (Interval s, Interval e) {
        start = s;
        end = e;
    }
}

class Pair {
    public Vertex v;
    public int i;
    Pair(Vertex a, int b) {
        v = a;
        i = b;
    }
}
 
