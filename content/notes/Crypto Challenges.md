
Install Sage. Easiest way is using a container:

```bash
docker pull sagemath/sagemath:latest
```

To open an interactive Sage shell:

```bash
docker run -it sagemath/sagemath:latest sage
```

To mount a local directory to share scripts between your host and the container (in this example, inside Sage the files will be in `/work`):

```bash
docker run -it -v $(pwd):/work sagemath/sagemath:latest sage
```

Run Sage with Jupyter (graphical web interface):

```bash
docker run -it -p 8888:8888 sagemath/sagemath:latest sage -n jupyter --ip=0.0.0.0 --no-browser --allow-root
```
