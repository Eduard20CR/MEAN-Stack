import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { copyFile } from 'fs';
import { title } from 'process';
import { Subscription } from 'rxjs';
import { PostModel } from 'src/app/shared/models/posrtModel';
import { PostService } from 'src/app/shared/services/post.service';
import { mimeType } from 'src/app/shared/validators/mime-type.validator';

@Component({
  selector: '[app-post-create]',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.scss'],
})
export class PostCreateComponent implements OnInit, OnDestroy {
  enteredTitle = '';
  enteredContent = '';
  postToBeEdited!: PostModel;
  isLoading = false;
  imageUrlPreview!: string;
  private mode = 'create';
  private postId!: string;
  private authStatusSubscription!: Subscription;

  form: FormGroup = new FormGroup({
    title: new FormControl(
      '',
      [Validators.required, Validators.minLength(3)],
      [mimeType]
    ),
    content: new FormControl('', [Validators.required]),
    image: new FormControl(null, [Validators.required]),
  });

  constructor(
    private postService: PostService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.setUpSubscriptions();
  }

  onSubmitPost() {
    if (this.form.invalid) return;
    this.isLoading = true;
    if (this.mode == 'create') this.addNewPost();
    else this.editPost();
    // this.form.reset();
  }

  addNewPost() {
    const postData = new FormData();
    postData.append('title', this.form.value.title);
    postData.append('content', this.form.value.content);
    postData.append('image', this.form.value.image);

    const post = {
      id: '',
      title: this.form.value.title,
      content: this.form.value.content,
      image: this.form.value.image,
    };
    this.postService.addPost(post);
  }
  editPost() {
    this.postService.updatePost(
      this.postId,
      this.form.value.title,
      this.form.value.content,
      this.form.value.image
    );
  }
  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files as FileList;

    this.form.patchValue({ image: file[0] });
    this.form.get('image')?.updateValueAndValidity();

    const reader = new FileReader();
    reader.onload = () => {
      this.imageUrlPreview = reader.result as string;
    };

    reader.readAsDataURL(file[0]);
  }
  setUpSubscriptions() {
    this.authStatusSubscription =
      this.postService.subjectErrorHandler.subscribe(() => {
        this.isLoading = false;
      });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.isLoading = true;
        this.mode = 'edit';
        this.postId = paramMap.get('postId') || '';
        this.postService.getPostById(this.postId).subscribe((res) => {
          this.postToBeEdited = {
            id: res.post._id,
            title: res.post.title,
            content: res.post.content,
            imagePath: res.post.imagePath,
          };
          this.form.setValue({
            title: res.post.title,
            content: res.post.content,
            image: res.post.imagePath,
          });
          this.isLoading = false;
        });
      } else {
        this.mode = 'create';
        this.postId = '';
        this.postToBeEdited = { id: '', title: '', content: '', imagePath: '' };
      }
    });
  }
  ngOnDestroy(): void {
    this.authStatusSubscription.unsubscribe();
  }
}
