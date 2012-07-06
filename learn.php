<?php

header('Content-Type: application/json');
$learn = array(1 => array('title' => "Robert Baden-Powell",
                          'description' => '<img src="http://www.pinetreeweb.com/bp.jpg" /><p>After having been educated at Charterhouse School, Baden-Powell served in the British Army from 1876 until 1910 in India and Africa. In 1899, during the Second Boer War in South Africa, Baden-Powell successfully defended the town in the Siege of Mafeking. Several of his military books, written for military reconnaissance and scout training in his African years, were also read by boys. Based on those earlier books, he wrote Scouting for Boys, published in 1908 by Sir Arthur Pearson, for youth readership. In 1907, he held the first Brownsea Island Scout camp, which is now seen as the beginning of Scouting.</p>' ),
               2 => array('title' => "Membership Badge",
                          'description' => '<img src="http://5thrisca.sharepoint.com/siteimages/m-cl-mb.gif" width="120" />
                              <p>Scouts around the world wear the World
Membership Badge but questions are often asked
about the origins of this Scout emblem.</p><p>
The basic design of the emblem is used by Scouts
in all the 216 Scouting countries and territories.
The Scout emblem is one of the most widely
recognised symbols in the world, because it has
been worn by an estimated 300 million former
Scouts and is currently used by more than 28
million present Scouts.</p><p>
There is evidence that the basic arrowhead
design was being used as a direction symbol by
the Chinese as early as 2000 B.C. The Larousse
Encyclopaedia notes that some Etruscan bronzes
and Roman ornaments carried the design.  Also, it
has been found on ancient monuments in Egypt
and India.</p><p>
Marco Polo brought it to Europe when he returned
with a compass from Cathay at the end of the
13th Century.  The Grand Encyclopaedia credits
an Italian marine pilot named Flavio Giojo of
Amalfi for drawing it as the north point of the
primitive compass he built.</p>'));
$id = isset($_REQUEST['id']) ? $_REQUEST['id'] : 0;
if(isset($learn[$id]))
{
    echo json_encode($learn[$id]);
}
else
    header('HTTP/1.1 404 Not Found');
?>
