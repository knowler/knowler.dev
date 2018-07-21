<?php

namespace App;

use Sober\Controller\Controller;

class FrontPage extends Controller
{
    public function jam()
    {
        $jams = carbon_get_the_post_meta('jams');

        return (object) $jams[random_int(0, count($jams) - 1)];
    }

    public function connects()
    {
        return cast_objects(carbon_get_the_post_meta('connects'));
    }
}
